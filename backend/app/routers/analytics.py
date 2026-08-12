from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.schemas.analytics import PaginatedAuditLogs, DashboardStats
from app.services import analytics

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

@router.get("/audit-logs", response_model=PaginatedAuditLogs)
def list_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics.get_audit_logs(db, current_user.id, page, limit)

@router.get("/dashboard-stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return analytics.get_dashboard_stats(db, current_user.id)
