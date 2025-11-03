"""
Admin routes - Phase 1: Read-only dashboard
Handles viewing all registrations (approval/rejection in Phase 2)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from database import get_db
from models.registration import Registration

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class RegistrationSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    team_name: Optional[str]
    members: Optional[str]
    status: str
    created_at: str

    class Config:
        from_attributes = True


class RegistrationsResponse(BaseModel):
    total: int
    pending: int
    approved: int
    rejected: int
    registrations: List[RegistrationSummary]


@router.get("/registrations", response_model=RegistrationsResponse)
async def get_all_registrations(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all registrations with optional status filter
    Phase 1: Read-only view
    """
    query = db.query(Registration)
    
    # Apply filter if provided
    if status_filter:
        if status_filter not in ["pending", "approved", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status filter. Use: pending, approved, or rejected"
            )
        query = query.filter(Registration.status == status_filter)
    
    registrations = query.order_by(Registration.created_at.desc()).all()
    
    # Calculate counts
    all_regs = db.query(Registration).all()
    counts = {
        "pending": sum(1 for r in all_regs if r.status == "pending"),
        "approved": sum(1 for r in all_regs if r.status == "approved"),
        "rejected": sum(1 for r in all_regs if r.status == "rejected"),
    }
    
    return RegistrationsResponse(
        total=len(all_regs),
        pending=counts["pending"],
        approved=counts["approved"],
        rejected=counts["rejected"],
        registrations=[
            RegistrationSummary(
                id=reg.id,
                name=reg.name,
                email=reg.email,
                phone=reg.phone,
                team_name=reg.team_name,
                members=reg.members,
                status=reg.status,
                created_at=reg.created_at.isoformat()
            )
            for reg in registrations
        ]
    )


@router.get("/registrations/{registration_id}")
async def get_registration_detail(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information for a specific registration
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    return {
        "id": registration.id,
        "name": registration.name,
        "email": registration.email,
        "phone": registration.phone,
        "team_name": registration.team_name,
        "members": registration.members,
        "status": registration.status,
        "created_at": registration.created_at.isoformat(),
        "updated_at": registration.updated_at.isoformat()
    }


@router.get("/stats")
async def get_statistics(db: Session = Depends(get_db)):
    """
    Get dashboard statistics
    """
    all_regs = db.query(Registration).all()
    
    return {
        "total_registrations": len(all_regs),
        "pending": sum(1 for r in all_regs if r.status == "pending"),
        "approved": sum(1 for r in all_regs if r.status == "approved"),
        "rejected": sum(1 for r in all_regs if r.status == "rejected"),
        "with_teams": sum(1 for r in all_regs if r.team_name),
    }
