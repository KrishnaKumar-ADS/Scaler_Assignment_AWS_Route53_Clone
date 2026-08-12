from sqlalchemy.orm import Session
from datetime import datetime

from app.models.audit_log import AuditLog

def log_action(
    db: Session, 
    user_id: int, 
    action: str, 
    resource_type: str, 
    resource_id: int, 
    description: str,
    source: str = "SYSTEM"
):
    log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        description=description,
        source=source,
        created_at=datetime.utcnow()
    )
    db.add(log)
    db.commit()
    return log
