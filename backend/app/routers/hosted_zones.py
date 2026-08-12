from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.hosted_zone import HostedZoneCreate, HostedZoneUpdate, HostedZoneResponse, PaginatedHostedZones
from app.services import hosted_zones

router = APIRouter(prefix="/api/hosted-zones", tags=["hosted-zones"])

@router.get("", response_model=PaginatedHostedZones)
def list_hosted_zones(
    search: str = None,
    type: str = Query("ALL"),
    status: str = Query("ALL"),
    created: str = Query("ALL"),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return hosted_zones.get_hosted_zones(
        db=db, 
        user_id=current_user.id, 
        search=search, 
        zone_type=type, 
        zone_status=status, 
        created=created, 
        page=page, 
        limit=limit
    )

@router.post("", response_model=HostedZoneResponse)
def create_zone(
    zone_data: HostedZoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return hosted_zones.create_hosted_zone(db, current_user.id, zone_data)

@router.get("/{zone_id}", response_model=HostedZoneResponse)
def get_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return hosted_zones.get_hosted_zone(db, current_user.id, zone_id)

@router.put("/{zone_id}", response_model=HostedZoneResponse)
def update_zone(
    zone_id: int,
    zone_data: HostedZoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return hosted_zones.update_hosted_zone(db, current_user.id, zone_id, zone_data)

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return hosted_zones.delete_hosted_zone(db, current_user.id, zone_id)
