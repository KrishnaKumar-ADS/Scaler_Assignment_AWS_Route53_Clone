from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    user_email: Optional[str] = "demo@example.com"
    action: str
    resource_type: str
    entity_type: Optional[str] = None
    resource_id: Optional[int] = None
    entity_name: Optional[str] = None
    description: Optional[str] = None
    source: str = "SYSTEM"
    created_at: datetime
    timestamp: Optional[datetime] = None

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
