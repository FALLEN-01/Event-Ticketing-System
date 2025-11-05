from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
from models.registration import Registration, Payment, Attendance, Message, PaymentStatus, PaymentType, MessageType
from utils.qr_generator import generate_ticket_qr
from utils.email import send_approval_email, send_rejection_email

router = APIRouter(prefix="/api/admin", tags=["Admin"])


class RegistrationSummary(BaseModel):
    id: int
    name: str
    email: str
    phone: str
    team_name: Optional[str]
    members: Optional[str]
    status: str
    payment_type: str
    payment_screenshot: Optional[str]
    created_at: str

    class Config:
        from_attributes = True


class ApproveRequest(BaseModel):
    """Request body for approving a registration"""
    pass


class RejectRequest(BaseModel):
    """Request body for rejecting a registration"""
    reason: Optional[str] = None


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
    Joins with Payment table to get approval status
    """
    # Join Registration with Payment table
    query = db.query(Registration, Payment).join(
        Payment, Registration.id == Payment.registration_id
    )
    
    # Apply filter if provided
    if status_filter:
        if status_filter not in ["pending", "approved", "rejected"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status filter. Use: pending, approved, or rejected"
            )
        query = query.filter(Payment.status == status_filter)
    
    results = query.order_by(Registration.created_at.desc()).all()
    
    # Calculate counts from all payments
    all_payments = db.query(Payment).all()
    counts = {
        "pending": sum(1 for p in all_payments if p.status == PaymentStatus.PENDING),
        "approved": sum(1 for p in all_payments if p.status == PaymentStatus.APPROVED),
        "rejected": sum(1 for p in all_payments if p.status == PaymentStatus.REJECTED),
    }
    
    return RegistrationsResponse(
        total=len(all_payments),
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
                status=payment.status.value,
                payment_type=payment.payment_type.value,
                payment_screenshot=payment.payment_screenshot,
                created_at=reg.created_at.isoformat()
            )
            for reg, payment in results
        ]
    )


@router.get("/registrations/{registration_id}")
async def get_registration_detail(
    registration_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information for a specific registration
    Joins with Payment and Attendance tables for complete view
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Get related payment info
    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    
    # Get related attendance info
    attendance = db.query(Attendance).filter(Attendance.registration_id == registration_id).first()
    
    return {
        "id": registration.id,
        "name": registration.name,
        "email": registration.email,
        "phone": registration.phone,
        "team_name": registration.team_name,
        "members": registration.members,
        "serial_code": registration.serial_code,
        "qr_code_path": registration.qr_code_path,
        "created_at": registration.created_at.isoformat(),
        "updated_at": registration.updated_at.isoformat(),
        "payment": {
            "status": payment.status.value if payment else "pending",
            "payment_type": payment.payment_type.value if payment else "individual",
            "payment_screenshot": payment.payment_screenshot if payment else None,
            "amount": payment.amount if payment else None,
            "payment_method": payment.payment_method if payment else None,
            "rejection_reason": payment.rejection_reason if payment else None,
            "approved_by": payment.approved_by if payment else None,
            "approved_at": payment.approved_at.isoformat() if payment and payment.approved_at else None,
        },
        "attendance": {
            "checked_in": attendance.checked_in if attendance else False,
            "check_in_time": attendance.check_in_time.isoformat() if attendance and attendance.check_in_time else None,
            "checked_out": attendance.checked_out if attendance else False,
            "check_out_time": attendance.check_out_time.isoformat() if attendance and attendance.check_out_time else None,
        }
    }


@router.get("/stats")
async def get_statistics(db: Session = Depends(get_db)):
    """
    Get dashboard statistics from Payment table
    """
    all_payments = db.query(Payment).all()
    all_registrations = db.query(Registration).all()
    
    return {
        "total_registrations": len(all_payments),
        "pending": sum(1 for p in all_payments if p.status == PaymentStatus.PENDING),
        "approved": sum(1 for p in all_payments if p.status == PaymentStatus.APPROVED),
        "rejected": sum(1 for p in all_payments if p.status == PaymentStatus.REJECTED),
        "with_teams": sum(1 for r in all_registrations if r.team_name),
    }


@router.post("/registrations/{registration_id}/approve")
async def approve_registration(
    registration_id: int,
    approved_by: str = "admin",
    db: Session = Depends(get_db)
):
    """
    Approve a registration and send ticket via email
    Updates Payment table status to APPROVED
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Get payment record
    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    if payment.status == PaymentStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is already approved"
        )
    
    try:
        # Generate QR code ticket
        qr_code_path = generate_ticket_qr(
            serial_code=registration.serial_code,
            name=registration.name,
            email=registration.email
        )
        
        # Update payment status
        payment.status = PaymentStatus.APPROVED
        payment.approved_by = approved_by
        payment.approved_at = datetime.utcnow()
        
        # Update registration with QR code path
        registration.qr_code_path = qr_code_path
        
        db.commit()
        
        # Send approval email with ticket
        email_sent = await send_approval_email(
            to_email=registration.email,
            name=registration.name,
            serial_code=registration.serial_code,
            qr_code_path=qr_code_path,
            team_name=registration.team_name
        )
        
        # Log email in Message table
        message = Message(
            registration_id=registration.id,
            message_type=MessageType.APPROVAL,
            subject="🎉 Event Registration Approved - Your Ticket Inside!",
            body=f"Approval email sent to {registration.email}",
            sent=email_sent,
            sent_at=datetime.utcnow() if email_sent else None,
            recipient_email=registration.email,
            has_attachment=True,
            attachment_path=qr_code_path
        )
        db.add(message)
        db.commit()
        
        return {
            "message": "Registration approved successfully",
            "email_sent": email_sent,
            "qr_code_generated": True,
            "registration": {
                "id": registration.id,
                "name": registration.name,
                "email": registration.email,
                "status": payment.status.value,
                "serial_code": registration.serial_code
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve registration: {str(e)}"
        )


@router.post("/registrations/{registration_id}/reject")
async def reject_registration(
    registration_id: int,
    reject_data: RejectRequest,
    db: Session = Depends(get_db)
):
    """
    Reject a registration and send rejection email
    Updates Payment table status to REJECTED
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Get payment record
    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Payment record not found"
        )
    
    if payment.status == PaymentStatus.REJECTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is already rejected"
        )
    
    try:
        # Update payment status
        payment.status = PaymentStatus.REJECTED
        payment.rejection_reason = reject_data.reason
        db.commit()
        
        # Send rejection email
        email_sent = await send_rejection_email(
            to_email=registration.email,
            name=registration.name,
            reason=reject_data.reason
        )
        
        # Log email in Message table
        message = Message(
            registration_id=registration.id,
            message_type=MessageType.REJECTION,
            subject="❌ Event Registration - Payment Not Approved",
            body=f"Rejection email sent to {registration.email}: {reject_data.reason}",
            sent=email_sent,
            sent_at=datetime.utcnow() if email_sent else None,
            recipient_email=registration.email,
            has_attachment=False
        )
        db.add(message)
        db.commit()
        
        return {
            "message": "Registration rejected successfully",
            "email_sent": email_sent,
            "registration": {
                "id": registration.id,
                "name": registration.name,
                "email": registration.email,
                "status": payment.status.value,
                "rejection_reason": reject_data.reason
            }
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reject registration: {str(e)}"
        )
