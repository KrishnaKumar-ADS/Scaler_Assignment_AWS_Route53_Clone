from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime

class DNSRecordCreate(BaseModel):
    name: str
    record_type: Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]
    value: str
    ttl: Optional[int] = 300

class DNSRecordUpdate(BaseModel):
    name: Optional[str] = None
    record_type: Optional[Literal["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"]] = None
    value: Optional[str] = None
    ttl: Optional[int] = None

class DNSRecordResponse(BaseModel):
    id: int
    hosted_zone_id: int
    name: str
    record_type: str
    value: str
    ttl: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PaginatedDNSRecords(BaseModel):
    items: list[DNSRecordResponse]
    total: int
    page: int
    limit: int
