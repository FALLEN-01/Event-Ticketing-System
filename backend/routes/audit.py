"""
Audit logs viewing routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.registration import AuditLog, Admin

router = APIRouter(prefix="/api/admin/audit", tags=["Audit Logs"])


class AuditLogResponse(BaseModel):
    id: int
    admin_id: int
    admin_name: str
    admin_email: str
    action: str
    details: Optional[str]
    registration_id: Optional[int]
    ip_address: Optional[str]
    user_agent: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    action: Optional[str] = Query(None),
    admin_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Get audit logs with pagination and filtering
    """
    query = db.query(AuditLog).join(Admin)
    
    # Filter by action if provided
    if action:
        query = query.filter(AuditLog.action == action)
    
    # Filter by admin if provided
    if admin_id:
        query = query.filter(AuditLog.admin_id == admin_id)
    
    # Order by most recent first
    query = query.order_by(AuditLog.created_at.desc())
    
    # Apply pagination
    logs = query.offset(offset).limit(limit).all()
    
    # Format response with admin details
    results = []
    for log in logs:
        results.append({
            "id": log.id,
            "admin_id": log.admin_id,
            "admin_name": log.admin.name,
            "admin_email": log.admin.email,
            "action": log.action,
            "details": log.details,
            "registration_id": log.registration_id,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at
        })
    
    return results


@router.get("/stats")
def get_audit_stats(db: Session = Depends(get_db)):
    """
    Get audit log statistics
    """
    total_logs = db.query(AuditLog).count()
    
    # Count by action type
    action_counts = {}
    actions = db.query(AuditLog.action, func.count(AuditLog.id)).group_by(AuditLog.action).all()
    for action, count in actions:
        action_counts[action] = count
    
    # Recent activity (last 24 hours)
    from datetime import timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    recent_count = db.query(AuditLog).filter(AuditLog.created_at >= yesterday).count()
    
    return {
        "total_logs": total_logs,
        "action_counts": action_counts,
        "last_24h": recent_count
    }
