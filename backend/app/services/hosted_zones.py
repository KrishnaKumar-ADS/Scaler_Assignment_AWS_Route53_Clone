from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from app.models.hosted_zone import HostedZone
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate
from app.services.audit import log_action

def get_hosted_zones(
    db: Session, 
    user_id: int, 
    search: str = None, 
    zone_type: str = None, 
    zone_status: str = None, 
    created: str = None,
    page: int = 1,
    limit: int = 20
):
    query = db.query(HostedZone).filter(HostedZone.user_id == user_id)

    if search:
        query = query.filter(HostedZone.name.ilike(f"%{search}%"))
    if zone_type and zone_type != "ALL":
        query = query.filter(HostedZone.zone_type == zone_type)
    if zone_status and zone_status != "ALL":
        query = query.filter(HostedZone.status == zone_status)
    if created and created != "ALL":
        now = datetime.utcnow()
        if created == "7d":
            query = query.filter(HostedZone.created_at >= now - timedelta(days=7))
        elif created == "30d":
            query = query.filter(HostedZone.created_at >= now - timedelta(days=30))
        elif created == "90d":
            query = query.filter(HostedZone.created_at >= now - timedelta(days=90))

    total = query.count()
    items = query.order_by(HostedZone.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return {"items": items, "total": total}


def get_hosted_zone(db: Session, user_id: int, zone_id: int):
    zone = db.query(HostedZone).filter(HostedZone.id == zone_id, HostedZone.user_id == user_id).first()
    if not zone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Hosted zone not found")
    return zone


def create_hosted_zone(db: Session, user_id: int, zone_data: HostedZoneCreate):
    zone = HostedZone(
        user_id=user_id,
        name=zone_data.name,
        zone_type=zone_data.zone_type,
        description=zone_data.description,
        status="ACTIVE"
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)

    log_action(db, user_id, "CREATE_HOSTED_ZONE", "HOSTED_ZONE", zone.id, f"Created {zone.name}", "UI")
    return zone


def update_hosted_zone(db: Session, user_id: int, zone_id: int, zone_data: HostedZoneUpdate):
    zone = get_hosted_zone(db, user_id, zone_id)

    if zone_data.description is not None:
        zone.description = zone_data.description
    if zone_data.zone_type is not None:
        zone.zone_type = zone_data.zone_type
    if zone_data.status is not None:
        zone.status = zone_data.status

    db.commit()
    db.refresh(zone)

    log_action(db, user_id, "UPDATE_HOSTED_ZONE", "HOSTED_ZONE", zone.id, f"Updated {zone.name}", "UI")
    return zone


def delete_hosted_zone(db: Session, user_id: int, zone_id: int):
    zone = get_hosted_zone(db, user_id, zone_id)
    name = zone.name

    db.delete(zone)
    db.commit()

    log_action(db, user_id, "DELETE_HOSTED_ZONE", "HOSTED_ZONE", zone_id, f"Deleted {name}", "UI")
    return {"message": "Hosted zone deleted successfully"}
