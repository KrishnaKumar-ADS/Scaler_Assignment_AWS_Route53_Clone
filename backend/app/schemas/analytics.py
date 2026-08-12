from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource_type: str
    resource_id: Optional[int]
    description: Optional[str]
    source: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedAuditLogs(BaseModel):
    items: list[AuditLogResponse]
    total: int

class DashboardStats(BaseModel):
    total_hosted_zones: int
    total_dns_records: int
    public_zones: int
    private_zones: int
    recent_activity_count: int # Actions in last 24h
