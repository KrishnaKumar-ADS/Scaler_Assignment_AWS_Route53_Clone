from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.models.audit_log import AuditLog
from app.models.hosted_zone import HostedZone
from app.models.dns_record import DNSRecord

def get_audit_logs(db: Session, user_id: int, page: int = 1, limit: int = 50):
    query = db.query(AuditLog).filter(AuditLog.user_id == user_id)
    total = query.count()
    items = query.order_by(AuditLog.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    
    return {"items": items, "total": total}

def get_dashboard_stats(db: Session, user_id: int):
    # Total zones
    total_zones = db.query(HostedZone).filter(HostedZone.user_id == user_id).count()
    
    # Public vs Private zones
    public_zones = db.query(HostedZone).filter(HostedZone.user_id == user_id, HostedZone.zone_type == "PUBLIC").count()
    private_zones = db.query(HostedZone).filter(HostedZone.user_id == user_id, HostedZone.zone_type == "PRIVATE").count()
    
    # Total DNS records (across all owned zones)
    # Using a join or subquery. Easiest is to sum record_count from HostedZone
    zones = db.query(HostedZone.record_count).filter(HostedZone.user_id == user_id).all()
    total_dns_records = sum(z[0] for z in zones) if zones else 0
    
    # Recent activity count (last 24h)
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_activity = db.query(AuditLog).filter(
        AuditLog.user_id == user_id,
        AuditLog.created_at >= yesterday
    ).count()
    
    return {
        "total_hosted_zones": total_zones,
        "total_dns_records": total_dns_records,
        "public_zones": public_zones,
        "private_zones": private_zones,
        "recent_activity_count": recent_activity
    }
