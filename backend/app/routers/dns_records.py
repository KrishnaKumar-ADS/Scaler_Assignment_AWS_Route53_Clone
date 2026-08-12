from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Response
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse
from app.schemas.bulk import BulkDeleteRequest
from app.services import dns_records, dns_parser, hosted_zones

router = APIRouter(prefix="/api/hosted-zones", tags=["dns-records"])

@router.get("/{zone_id}/records", response_model=list[DNSRecordResponse])
def list_dns_records(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_records.get_dns_records(db, current_user.id, zone_id)

@router.post("/{zone_id}/records", response_model=DNSRecordResponse)
def create_record(
    zone_id: int,
    record_data: DNSRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_records.create_dns_record(db, current_user.id, zone_id, record_data)

@router.get("/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def get_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_records.get_dns_record(db, current_user.id, zone_id, record_id)

@router.put("/{zone_id}/records/{record_id}", response_model=DNSRecordResponse)
def update_record(
    zone_id: int,
    record_id: int,
    record_data: DNSRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_records.update_dns_record(db, current_user.id, zone_id, record_id, record_data)

@router.delete("/{zone_id}/records/{record_id}")
def delete_record(
    zone_id: int,
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return dns_records.delete_dns_record(db, current_user.id, zone_id, record_id)

@router.post("/{zone_id}/records/bulk-delete")
def bulk_delete_records(
    zone_id: int,
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    deleted_count = 0
    for rid in request.ids:
        try:
            dns_records.delete_dns_record(db, current_user.id, zone_id, rid)
            deleted_count += 1
        except Exception:
            pass
    return {"message": f"Successfully deleted {deleted_count} records"}

@router.post("/{zone_id}/records/import")
async def import_bind_file(
    zone_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify zone exists
    hosted_zones.get_hosted_zone(db, current_user.id, zone_id)
    content = await file.read()
    records = dns_parser.parse_bind_file(content.decode("utf-8"))
    
    imported_count = 0
    for rec in records:
        try:
            record_data = DNSRecordCreate(
                name=rec["name"],
                record_type=rec["record_type"],
                value=rec["value"],
                ttl=rec["ttl"]
            )
            dns_records.create_dns_record(db, current_user.id, zone_id, record_data)
            imported_count += 1
        except Exception as e:
            pass
            
    return {"message": f"Successfully imported {imported_count} records"}

@router.get("/{zone_id}/export")
def export_zone(
    zone_id: int,
    format: str = "json",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    zone = hosted_zones.get_hosted_zone(db, current_user.id, zone_id)
    records = dns_records.get_dns_records(db, current_user.id, zone_id)
    
    if format == "bind":
        bind_str = dns_parser.export_to_bind(zone.name, [{"name": r.name, "record_type": r.record_type, "value": r.value, "ttl": r.ttl} for r in records])
        return Response(content=bind_str, media_type="text/plain")
        
    # JSON format
    return {
        "zone": {"name": zone.name, "type": zone.type, "status": zone.status},
        "records": [{"name": r.name, "record_type": r.record_type, "value": r.value, "ttl": r.ttl} for r in records]
    }
