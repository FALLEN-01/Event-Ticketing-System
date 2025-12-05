from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import os
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx
from io import BytesIO

from database import get_db
from models.registration import Registration, Payment, Ticket, Attendance, Message, PaymentStatus, PaymentType, MessageType
from models.settings import Settings
from utils.email import send_pending_confirmation_email
from utils.storage import upload_payment_screenshot
import json
from datetime import datetime
import re

router = APIRouter(prefix="/api", tags=["Registration"])
limiter = Limiter(key_func=get_remote_address)


class RegistrationCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=20)
    team_name: Optional[str] = Field(None, max_length=255)
    members: Optional[str] = None  # Comma-separated names

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john@example.com",
                "phone": "+1234567890",
                "team_name": "Tech Wizards",
                "members": "Alice, Bob, Charlie"
            }
        }


class RegistrationResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str
    message: str

    class Config:
        from_attributes = True


@router.post("/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/minute")
async def register(
    request: Request,
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    team_name: Optional[str] = Form(None),
    members: Optional[str] = Form(None),
    payment_type: str = Form(...),
    payment_screenshot: UploadFile = File(...),
    amount: str = Form(...),
    db: Session = Depends(get_db)
):
    name = re.sub(r'[<>\"\'&]', '', name.strip())
    email = email.strip().lower()
    phone = re.sub(r'[^\d\+\-\s()]', '', phone.strip())
    if team_name:
        team_name = re.sub(r'[<>\"\'&]', '', team_name.strip())
    if members:
        members = re.sub(r'[<>\"\'&]', '', members.strip())
    
    # Validate email format
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate payment type
    if payment_type not in ["individual", "bulk"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment type. Use 'individual' or 'bulk'"
        )
    
    # Check if email already exists
    existing = db.query(Registration).filter(Registration.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered for the event"
        )
    
    # Validate file type
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
    file_ext = os.path.splitext(payment_screenshot.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    file_content = await payment_screenshot.read()
    file_url = await upload_payment_screenshot(file_content, payment_screenshot.filename)
    
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload payment screenshot to storage"
        )
    
    try:
        new_registration = Registration(
            name=name,
            email=email,
            phone=phone,
            team_name=team_name,
            members=members,
            payment_type=PaymentType.BULK if payment_type == "bulk" else PaymentType.INDIVIDUAL
        )
        db.add(new_registration)
        db.flush()
        
        new_payment = Payment(
            registration_id=new_registration.id,
            payment_screenshot=file_url,
            status=PaymentStatus.PENDING,
            amount=float(amount),
            payment_method="UPI"
        )
        db.add(new_payment)
        db.flush()
        
        # Create tickets based on payment type
        tickets_created = []
        if payment_type == "individual":
            ticket = Ticket(
                registration_id=new_registration.id,
                member_name=name,
                serial_code=Ticket.generate_serial_code(new_registration.id, is_bulk=False)
            )
            db.add(ticket)
            db.flush()
            tickets_created.append(ticket)
            
            attendance = Attendance(
                ticket_id=ticket.id,
                checked_in=False
            )
            db.add(attendance)
            
        else:
            member_names = []
            if members:
                try:
                    member_names = json.loads(members)
                    if not isinstance(member_names, list):
                        member_names = [str(members)]
                except json.JSONDecodeError:
                    member_names = [m.strip() for m in members.split(',') if m.strip()]
            if len(member_names) != 4:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bulk registration requires exactly 4 members. Got {len(member_names)} members."
                )
            
            for idx, member_name in enumerate(member_names):
                ticket = Ticket(
                    registration_id=new_registration.id,
                    member_name=member_name,
                    serial_code=Ticket.generate_serial_code(new_registration.id, is_bulk=True, member_index=idx)
                )
                db.add(ticket)
                db.flush()
                tickets_created.append(ticket)
                
                attendance = Attendance(
                    ticket_id=ticket.id,
                    checked_in=False
                )
                db.add(attendance)
        
        db.commit()
        db.refresh(new_registration)
        
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", None)
        
        from utils.audit import log_audit, AuditAction
        log_audit(
            db=db,
            admin_id=1,  # System user for public registrations
            action=AuditAction.NEW_REGISTRATION,
            details={
                "registration_id": new_registration.id,
                "name": name,
                "email": email,
                "payment_type": payment_type,
                "ticket_count": len(tickets_created),
                "amount": amount
            },
            registration_id=new_registration.id,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        try:
            email_sent = await send_pending_confirmation_email(email, name, tickets_created[0].serial_code if tickets_created else "PENDING")
            
            email_log = Message(
                registration_id=new_registration.id,
                message_type=MessageType.CONFIRMATION,
                subject="Event Registration Received - Pending Review",
                body=f"Confirmation email sent to {email}. Created {len(tickets_created)} ticket(s).",
                sent=email_sent,
                recipient_email=email,
                has_attachment=False
            )
            if email_sent:
                email_log.sent_at = datetime.utcnow()
            db.add(email_log)
            db.commit()
            
            if email_sent:
                log_audit(
                    db=db,
                    admin_id=1,
                    action=AuditAction.SEND_PENDING_EMAIL,
                    details={"email": email, "name": name},
                    registration_id=new_registration.id,
                    ip_address=ip_address,
                    user_agent=user_agent
                )
            
        except Exception as e:
            print(f"Warning: Failed to send confirmation email: {str(e)}")
        
        return RegistrationResponse(
            id=new_registration.id,
            name=new_registration.name,
            email=new_registration.email,
            status="pending",
            message="Registration submitted successfully! You will receive a confirmation email shortly. Our team will review your payment and send your ticket within 24-48 hours."
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create registration: {str(e)}"
        )


@router.get("/registration/status/{email}")
async def check_registration_status(email: str, db: Session = Depends(get_db)):
    registration = db.query(Registration).filter(Registration.email == email).first()
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found with this email"
        )
    
    payment = db.query(Payment).filter(Payment.registration_id == registration.id).first()
    payment_status = payment.status.value if payment else "pending"
    
    tickets_count = db.query(Ticket).filter(Ticket.registration_id == registration.id).count()
    
    tickets = db.query(Ticket).filter(Ticket.registration_id == registration.id).all()
    ticket_serials = [t.serial_code for t in tickets]
    
    return {
        "id": registration.id,
        "name": registration.name,
        "email": registration.email,
        "payment_type": registration.payment_type.value,
        "status": payment_status,
        "tickets_count": tickets_count,
        "ticket_serials": ticket_serials,
        "created_at": registration.created_at.isoformat()
    }


@router.get("/payment-qr/{qr_type}")
@limiter.limit("20/minute")
async def get_payment_qr_code(
    request: Request,
    qr_type: str,
    db: Session = Depends(get_db)
):
    if qr_type not in ["individual", "bulk"]:
        raise HTTPException(status_code=400, detail="Invalid QR type. Use 'individual' or 'bulk'")
    
    settings = db.query(Settings).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not configured")
    
    qr_url = settings.individual_qr_code if qr_type == "individual" else settings.bulk_qr_code
    
    if not qr_url:
        raise HTTPException(status_code=404, detail=f"{qr_type.capitalize()} QR code not uploaded yet")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(qr_url)
            response.raise_for_status()
            
            content_type = "image/png"
            if ".jpg" in qr_url or ".jpeg" in qr_url:
                content_type = "image/jpeg"
            elif ".svg" in qr_url:
                content_type = "image/svg+xml"
            
            return StreamingResponse(
                BytesIO(response.content),
                media_type=content_type,
                headers={
                    "Cache-Control": "public, max-age=3600",
                    "Content-Disposition": f"inline; filename={qr_type}_payment_qr.png"
                }
            )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch QR code: {str(e)}")
