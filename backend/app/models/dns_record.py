from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class DNSRecord(Base):
    __tablename__ = "dns_records"

    id = Column(Integer, primary_key=True, index=True)
    hosted_zone_id = Column(Integer, ForeignKey("hosted_zones.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    record_type = Column(String, nullable=False)
    value = Column(String, nullable=False)
    ttl = Column(Integer, default=300)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hosted_zone = relationship("HostedZone", backref="dns_records")
