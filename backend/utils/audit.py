"""
Audit logging utility
Tracks all admin actions with IP, user agent, and detailed context
"""
from sqlalchemy.orm import Session
from models.registration import AuditLog
from typing import Optional
import json


def log_audit(
    db: Session,
    admin_id: int,
    action: str,
    details: Optional[dict] = None,
    registration_id: Optional[int] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
):
    """
    Create an audit log entry
    
    Args:
        db: Database session
        admin_id: ID of admin performing action
        action: Action constant (e.g., "LOGIN", "APPROVE_PAYMENT")
        details: Dictionary with additional context
        registration_id: Related registration ID (if applicable)
        ip_address: Client IP address
        user_agent: Client user agent string
    """
    audit_entry = AuditLog(
        admin_id=admin_id,
        action=action,
        details=json.dumps(details) if details else None,
        registration_id=registration_id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    db.add(audit_entry)
    db.commit()
    return audit_entry


# Action constants
class AuditAction:
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    PASSWORD_CHANGE = "PASSWORD_CHANGE"
    APPROVE_PAYMENT = "APPROVE_PAYMENT"
    REJECT_PAYMENT = "REJECT_PAYMENT"
    CREATE_ADMIN = "CREATE_ADMIN"
    UPDATE_ADMIN = "UPDATE_ADMIN"
    DELETE_ADMIN = "DELETE_ADMIN"
    UPDATE_SETTINGS = "UPDATE_SETTINGS"
    UPLOAD_QR = "UPLOAD_QR"
    REGISTRATION_VIEW = "REGISTRATION_VIEW"
    REGISTRATION_LIST = "REGISTRATION_LIST"
    # New actions
    NEW_REGISTRATION = "NEW_REGISTRATION"
    TICKET_CHECKIN = "TICKET_CHECKIN"
    SEND_APPROVAL_EMAIL = "SEND_APPROVAL_EMAIL"
    SEND_REJECTION_EMAIL = "SEND_REJECTION_EMAIL"
    SEND_PENDING_EMAIL = "SEND_PENDING_EMAIL"
