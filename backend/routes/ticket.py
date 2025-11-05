from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.registration import Registration

router = APIRouter(tags=["Ticket Verification"])


class TicketDetails(BaseModel):
    """Response model for ticket verification"""
    serial_code: str
    name: str
    email: str
    phone: str
    team_name: Optional[str]
    members: Optional[str]
    ticket_used: bool
    status: str

    class Config:
        from_attributes = True


class TicketVerifyResponse(BaseModel):
    """Response for verification endpoint"""
    valid: bool
    message: str
    details: Optional[TicketDetails] = None


class MarkUsedResponse(BaseModel):
    """Response for mark as used endpoint"""
    success: bool
    message: str


@router.get("/verify-ticket/{serial}", response_model=TicketVerifyResponse)
async def verify_ticket(
    serial: str,
    db: Session = Depends(get_db)
):
    """
    Verify if a ticket serial code is valid
    Returns participant details if valid
    """
    # Find registration by serial code
    registration = db.query(Registration).filter(
        Registration.serial_code == serial.upper()
    ).first()
    
    if not registration:
        return TicketVerifyResponse(
            valid=False,
            message="Invalid serial code. Ticket not found.",
            details=None
        )
    
    # Check if registration is approved
    if registration.status != "approved":
        return TicketVerifyResponse(
            valid=False,
            message=f"Ticket status is '{registration.status}'. Only approved tickets are valid.",
            details=None
        )
    
    # Check if ticket has already been used
    if registration.ticket_used:
        return TicketVerifyResponse(
            valid=False,
            message="Ticket has already been used for entry.",
            details=TicketDetails.model_validate(registration)
        )
    
    # Ticket is valid
    return TicketVerifyResponse(
        valid=True,
        message="Ticket is valid and ready for entry.",
        details=TicketDetails.model_validate(registration)
    )


@router.post("/mark-used/{serial}", response_model=MarkUsedResponse)
async def mark_ticket_used(
    serial: str,
    db: Session = Depends(get_db)
):
    """
    Mark a ticket as used after successful entry
    """
    # Find registration by serial code
    registration = db.query(Registration).filter(
        Registration.serial_code == serial.upper()
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    # Check if ticket is already used
    if registration.ticket_used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket has already been marked as used"
        )
    
    # Check if registration is approved
    if registration.status != "approved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark ticket as used. Status is '{registration.status}'"
        )
    
    # Mark ticket as used
    registration.ticket_used = True
    db.commit()
    
    return MarkUsedResponse(
        success=True,
        message=f"Ticket marked as used successfully for {registration.name}"
    )
