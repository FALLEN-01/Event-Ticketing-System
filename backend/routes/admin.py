from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime, timedelta
import jwt
import os

from database import get_db
from models.registration import Registration, Payment, Ticket, Attendance, Message, PaymentStatus, PaymentType, MessageType, Admin
from utils.qr_generator import generate_ticket_qr
from utils.email import send_approval_email, send_rejection_email
from utils.audit import log_audit, AuditAction

router = APIRouter(prefix="/api/admin", tags=["Admin"])

# JWT configuration
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 12


class LoginRequest(BaseModel):
    email: str
    password: str
    role: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    user: dict


class RegistrationSummary(BaseModel):
    id: int
    serial_code: str
    name: str
    email: str
    phone: str
    team_name: Optional[str]
    members: Optional[str]
    status: str
    payment_type: str
    payment_screenshot: Optional[str]
    tickets_count: int
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


@router.post("/login", response_model=LoginResponse)
async def admin_login(
    login_data: LoginRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    # Find admin by email
    admin = db.query(Admin).filter(Admin.email == login_data.email).first()
    
    if not admin or not admin.verify_password(login_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Get client info
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", None)
    
    # Log successful login
    log_audit(
        db=db,
        admin_id=admin.id,
        action=AuditAction.LOGIN,
        details={"email": admin.email, "role": admin.role.value},
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    # Update last login
    admin.last_login = datetime.utcnow()
    db.commit()
    
    # Create access token
    expires = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    token_data = {
        "sub": login_data.email,
        "role": login_data.role or "admin",
        "exp": expires
    }
    access_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    # Set HTTP-only cookie
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_HOURS * 3600
    )
    
    user_data = {
        "id": admin.id,
        "email": admin.email,
        "role": login_data.role or admin.role,
        "name": admin.name
    }
    
    return {
        "access_token": access_token,
        "user": user_data
    }


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
                serial_code=f"REG-{reg.id:06d}",  # Generate registration serial code
                name=reg.name,
                email=reg.email,
                phone=reg.phone,
                team_name=reg.team_name,
                members=reg.members,
                status=payment.status.value,
                payment_type=reg.payment_type.value,  # Use reg.payment_type, not payment.payment_type
                payment_screenshot=payment.payment_screenshot,
                tickets_count=db.query(Ticket).filter(Ticket.registration_id == reg.id).count(),
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
    Includes all tickets and their attendance records
    """
    registration = db.query(Registration).filter(Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Get related payment info
    payment = db.query(Payment).filter(Payment.registration_id == registration_id).first()
    
    # Get all tickets for this registration
    tickets = db.query(Ticket).filter(Ticket.registration_id == registration_id).all()
    
    # Get attendance for each ticket
    tickets_data = []
    for ticket in tickets:
        attendance = db.query(Attendance).filter(Attendance.ticket_id == ticket.id).first()
        tickets_data.append({
            "id": ticket.id,
            "member_name": ticket.member_name,
            "serial_code": ticket.serial_code,
            "qr_code_path": ticket.qr_code_path,
            "is_active": ticket.is_active,
            "attendance": {
                "checked_in": attendance.checked_in if attendance else False,
                "check_in_time": attendance.check_in_time.isoformat() if attendance and attendance.check_in_time else None,
                "checked_out": attendance.checked_out if attendance else False,
                "check_out_time": attendance.check_out_time.isoformat() if attendance and attendance.check_out_time else None,
            }
        })
    
    return {
        "id": registration.id,
        "serial_code": f"REG-{registration.id:06d}",  # Generate registration serial code
        "name": registration.name,
        "email": registration.email,
        "phone": registration.phone,
        "team_name": registration.team_name,
        "members": registration.members,
        "payment_type": registration.payment_type.value,
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
        "tickets": tickets_data,
        "tickets_count": len(tickets_data)
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
    request: Request,
    approved_by: str = "admin",
    db: Session = Depends(get_db)
):
    """
    Approve a registration and send tickets via email
    Generates QR codes for all tickets (1 for individual, N for bulk)
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
        # Get all tickets for this registration
        tickets = db.query(Ticket).filter(Ticket.registration_id == registration_id).all()
        
        if not tickets:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tickets found for this registration"
            )
        
        # Generate QR codes for all tickets
        qr_code_paths = []
        for ticket in tickets:
            qr_code_path = await generate_ticket_qr(
                serial_code=ticket.serial_code,
                name=ticket.member_name,
                email=registration.email
            )
            
            # Update ticket with QR code path
            ticket.qr_code_path = qr_code_path
            qr_code_paths.append(qr_code_path)
        
        # Update payment status
        payment.status = PaymentStatus.APPROVED
        payment.approved_by = approved_by
        payment.approved_at = datetime.utcnow()
        
        db.commit()
        
        # Log approval action
        log_audit(
            db=db,
            admin_id=1,  # TODO: Get from JWT token
            action=AuditAction.APPROVE_PAYMENT,
            details={
                "registration_id": registration_id,
                "name": registration.name,
                "email": registration.email,
                "tickets_count": len(tickets)
            },
            registration_id=registration_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", None)
        )
        
        # Send approval email with all tickets
        email_sent = await send_approval_email(
            to_email=registration.email,
            name=registration.name,
            serial_code=tickets[0].serial_code,  # Send first ticket serial as reference
            qr_code_path=qr_code_paths[0] if len(qr_code_paths) == 1 else None,  # Single QR for individual
            team_name=registration.team_name,
            qr_code_paths=qr_code_paths if len(qr_code_paths) > 1 else None  # Multiple QRs for bulk
        )
        
        # Log email in Message table
        message = Message(
            registration_id=registration.id,
            message_type=MessageType.APPROVAL,
            subject="🎉 Event Registration Approved - Your Ticket(s) Inside!",
            body=f"Approval email sent to {registration.email} with {len(tickets)} ticket(s)",
            sent=email_sent,
            sent_at=datetime.utcnow() if email_sent else None,
            recipient_email=registration.email,
            has_attachment=True,
            attachment_path=qr_code_paths[0] if qr_code_paths else None
        )
        db.add(message)
        db.commit()
        
        return {
            "message": "Registration approved successfully",
            "email_sent": email_sent,
            "qr_codes_generated": len(qr_code_paths),
            "tickets_count": len(tickets),
            "registration": {
                "id": registration.id,
                "name": registration.name,
                "email": registration.email,
                "status": payment.status.value,
                "tickets": [
                    {
                        "serial_code": t.serial_code,
                        "member_name": t.member_name,
                        "qr_code_path": t.qr_code_path
                    }
                    for t in tickets
                ]
            }
        }
        
    except Exception as e:
        db.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in approve_registration: {str(e)}")
        print(f"Traceback: {error_details}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to approve registration: {str(e)}"
        )


@router.post("/registrations/{registration_id}/reject")
async def reject_registration(
    registration_id: int,
    reject_data: RejectRequest,
    request: Request,
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
        
        # Log rejection action
        log_audit(
            db=db,
            admin_id=1,  # TODO: Get from JWT token
            action=AuditAction.REJECT_PAYMENT,
            details={
                "registration_id": registration_id,
                "name": registration.name,
                "email": registration.email,
                "reason": reject_data.reason
            },
            registration_id=registration_id,
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent", None)
        )
        
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
