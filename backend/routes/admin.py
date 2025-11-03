"""
Admin routes - handles approval, rejection, and management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database import get_db
from models.registration import Registration, RegistrationStatus

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/registrations")
async def get_all_registrations(
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """
    Get all registrations (with optional status filter)
    """
    query = db.query(Registration)
    
    if status_filter:
        try:
            status_enum = RegistrationStatus(status_filter)
            query = query.filter(Registration.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status: {status_filter}"
            )
    
    registrations = query.order_by(Registration.created_at.desc()).all()
    
    return {
        "total": len(registrations),
        "registrations": [
            {
                "id": reg.id,
                "full_name": reg.full_name,
                "email": reg.email,
                "phone": reg.phone,
                "transaction_id": reg.transaction_id,
                "status": reg.status.value,
                "created_at": reg.created_at.isoformat(),
                "qr_code": reg.qr_code,
                "ticket_sent": reg.ticket_sent
            }
            for reg in registrations
        ]
    }


@router.patch("/registrations/{registration_id}/approve")
async def approve_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Approve a registration and trigger ticket generation
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    registration.status = RegistrationStatus.APPROVED
    registration.approved_at = datetime.utcnow()
    
    # TODO: Generate QR code and send email ticket
    
    db.commit()
    db.refresh(registration)
    
    return {
        "message": "Registration approved successfully",
        "registration_id": registration.id,
        "status": registration.status.value
    }


@router.patch("/registrations/{registration_id}/reject")
async def reject_registration(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Reject a registration
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    registration.status = RegistrationStatus.REJECTED
    
    db.commit()
    db.refresh(registration)
    
    return {
        "message": "Registration rejected",
        "registration_id": registration.id,
        "status": registration.status.value
    }
