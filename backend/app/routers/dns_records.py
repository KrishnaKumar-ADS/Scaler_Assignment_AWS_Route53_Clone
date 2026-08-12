from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate, DNSRecordResponse
from app.services import dns_records

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
