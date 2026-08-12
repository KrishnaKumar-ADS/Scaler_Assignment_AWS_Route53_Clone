from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.dns_record import DNSRecord
from app.models.hosted_zone import HostedZone
from app.schemas.dns_record import DNSRecordCreate, DNSRecordUpdate
from app.services.hosted_zones import get_hosted_zone
from app.services.audit import log_action

def get_dns_records(db: Session, user_id: int, zone_id: int):
    # Ensure user owns the zone
    get_hosted_zone(db, user_id, zone_id)
    return db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).order_by(DNSRecord.created_at.desc()).all()

def get_dns_record(db: Session, user_id: int, zone_id: int, record_id: int):
    get_hosted_zone(db, user_id, zone_id)
    record = db.query(DNSRecord).filter(DNSRecord.id == record_id, DNSRecord.hosted_zone_id == zone_id).first()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="DNS record not found")
    return record

def sync_record_count(db: Session, zone_id: int):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id).first()
    if zone:
        count = db.query(DNSRecord).filter(DNSRecord.hosted_zone_id == zone_id).count()
        zone.record_count = count
        db.commit()

def create_dns_record(db: Session, user_id: int, zone_id: int, record_data: DNSRecordCreate):
    zone = get_hosted_zone(db, user_id, zone_id)
    
    record = DNSRecord(
        hosted_zone_id=zone_id,
        name=record_data.name,
        record_type=record_data.record_type,
        value=record_data.value,
        ttl=record_data.ttl
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    sync_record_count(db, zone_id)
    log_action(db, user_id, "CREATE_DNS_RECORD", "HOSTED_ZONE", zone.id, f"Created {record.record_type} record {record.name}", "UI")
    return record

def update_dns_record(db: Session, user_id: int, zone_id: int, record_id: int, record_data: DNSRecordUpdate):
    record = get_dns_record(db, user_id, zone_id, record_id)
    
    if record_data.name is not None:
        record.name = record_data.name
    if record_data.record_type is not None:
        record.record_type = record_data.record_type
    if record_data.value is not None:
        record.value = record_data.value
    if record_data.ttl is not None:
        record.ttl = record_data.ttl
        
    db.commit()
    db.refresh(record)
    
    log_action(db, user_id, "UPDATE_DNS_RECORD", "HOSTED_ZONE", zone_id, f"Updated {record.record_type} record {record.name}", "UI")
    return record

def delete_dns_record(db: Session, user_id: int, zone_id: int, record_id: int):
    record = get_dns_record(db, user_id, zone_id, record_id)
    
    name = record.name
    type_ = record.record_type
    
    db.delete(record)
    db.commit()
    
    sync_record_count(db, zone_id)
    log_action(db, user_id, "DELETE_DNS_RECORD", "HOSTED_ZONE", zone_id, f"Deleted {type_} record {name}", "UI")
    return {"message": "DNS record deleted successfully"}
