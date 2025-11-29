from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from database import get_db
from models.registration import Registration, Ticket, Attendance, PaymentStatus, Payment
from datetime import datetime
from utils.audit import log_audit, AuditAction

router = APIRouter(tags=["Ticket Verification"])


class TicketDetails(BaseModel):
    serial_code: str
    member_name: str
    email: str
    phone: str
    team_name: Optional[str]
    is_active: bool
    checked_in: bool
    check_in_time: Optional[str]

    class Config:
        from_attributes = True


class TicketVerifyResponse(BaseModel):
    valid: bool
    message: str
    details: Optional[TicketDetails] = None


class MarkUsedResponse(BaseModel):
    success: bool
    message: str


@router.get("/verify-ticket/{serial}", response_model=TicketVerifyResponse)
async def verify_ticket(
    serial: str,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.serial_code == serial.upper()
    ).first()
    
    if not ticket:
        return TicketVerifyResponse(
            valid=False,
            message="Invalid serial code. Ticket not found.",
            details=None
        )
    
    registration = db.query(Registration).filter(Registration.id == ticket.registration_id).first()
    if not registration:
        return TicketVerifyResponse(
            valid=False,
            message="Registration not found for this ticket.",
            details=None
        )
    
    payment = db.query(Payment).filter(Payment.registration_id == registration.id).first()
    if not payment or payment.status != PaymentStatus.APPROVED:
        return TicketVerifyResponse(
            valid=False,
            message=f"Ticket payment is not approved. Status: {payment.status.value if payment else 'unknown'}",
            details=None
        )
    
    if not ticket.is_active:
        return TicketVerifyResponse(
            valid=False,
            message="Ticket has been deactivated.",
            details=None
        )
    
    attendance = db.query(Attendance).filter(Attendance.ticket_id == ticket.id).first()
    if attendance and attendance.checked_in:
        return TicketVerifyResponse(
            valid=False,
            message=f"Ticket already checked in at {attendance.check_in_time.isoformat() if attendance.check_in_time else 'unknown time'}.",
            details=TicketDetails(
                serial_code=ticket.serial_code,
                member_name=ticket.member_name,
                email=registration.email,
                phone=registration.phone,
                team_name=registration.team_name,
                is_active=ticket.is_active,
                checked_in=True,
                check_in_time=attendance.check_in_time.isoformat() if attendance.check_in_time else None
            )
        )
    
    return TicketVerifyResponse(
        valid=True,
        message="Ticket is valid and ready for check-in.",
        details=TicketDetails(
            serial_code=ticket.serial_code,
            member_name=ticket.member_name,
            email=registration.email,
            phone=registration.phone,
            team_name=registration.team_name,
            is_active=ticket.is_active,
            checked_in=False,
            check_in_time=None
        )
    )


@router.post("/mark-used/{serial}", response_model=MarkUsedResponse)
async def mark_ticket_used(
    serial: str,
    request: Request,
    db: Session = Depends(get_db)
):
    ticket = db.query(Ticket).filter(
        Ticket.serial_code == serial.upper()
    ).first()
    
    if not ticket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found"
        )
    
    if not ticket.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ticket is deactivated and cannot be used"
        )
    
    registration = db.query(Registration).filter(Registration.id == ticket.registration_id).first()
    payment = db.query(Payment).filter(Payment.registration_id == ticket.registration_id).first()
    
    if not payment or payment.status != PaymentStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment not approved. Cannot check in."
        )
    
    attendance = db.query(Attendance).filter(Attendance.ticket_id == ticket.id).first()
    
    if not attendance:
        attendance = Attendance(
            ticket_id=ticket.id,
            checked_in=False
        )
        db.add(attendance)
        db.flush()
    
    if attendance.checked_in:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ticket already checked in at {attendance.check_in_time.isoformat() if attendance.check_in_time else 'unknown time'}"
        )
    
    attendance.checked_in = True
    attendance.check_in_time = datetime.utcnow()
    db.commit()
    
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", None)
    
    log_audit(
        db=db,
        admin_id=1,
        action=AuditAction.TICKET_CHECKIN,
        details={
            "serial_code": ticket.serial_code,
            "member_name": ticket.member_name,
            "registration_id": registration.id,
            "check_in_time": attendance.check_in_time.isoformat()
        },
        registration_id=registration.id,
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return MarkUsedResponse(
        success=True,
        message=f"Ticket checked in successfully for {ticket.member_name}"
    )
