from pydantic import BaseModel, constr
from typing import Optional, Literal
from datetime import datetime

class HostedZoneCreate(BaseModel):
    name: str
    zone_type: Literal["PUBLIC", "PRIVATE"]
    description: Optional[str] = None

class HostedZoneUpdate(BaseModel):
    description: Optional[str] = None
    zone_type: Optional[Literal["PUBLIC", "PRIVATE"]] = None
    status: Optional[Literal["ACTIVE", "INACTIVE"]] = None

class HostedZoneResponse(BaseModel):
    id: int
    name: str
    zone_type: str
    status: str
    record_count: int
    description: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedHostedZones(BaseModel):
    items: list[HostedZoneResponse]
    total: int
