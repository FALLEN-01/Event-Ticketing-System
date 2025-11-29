from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import os

from database import get_db
from models.registration import Registration, Payment, Ticket, Attendance, Message, PaymentStatus, PaymentType, MessageType
from utils.email import send_pending_confirmation_email
from utils.storage import upload_payment_screenshot
import json
from datetime import datetime

router = APIRouter(prefix="/api", tags=["Registration"])


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
async def register(
    name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    team_name: Optional[str] = Form(None),
    members: Optional[str] = Form(None),
    payment_type: str = Form(...),  # "individual" or "bulk"
    payment_screenshot: UploadFile = File(...),
    amount: str = Form(...),  # Mandatory amount
    db: Session = Depends(get_db)
):
    """
    Submit a new event registration with payment screenshot
    Creates records in: Registration, Payment, Attendance tables
    """
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
    
    # Read file content
    file_content = await payment_screenshot.read()
    
    # Upload to Supabase Storage
    file_url = await upload_payment_screenshot(file_content, payment_screenshot.filename)
    
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload payment screenshot to storage"
        )
    
    try:
        # 1. Create registration record
        new_registration = Registration(
            name=name,
            email=email,
            phone=phone,
            team_name=team_name,
            members=members,
            payment_type=PaymentType.BULK if payment_type == "bulk" else PaymentType.INDIVIDUAL
        )
        db.add(new_registration)
        db.flush()  # Get the registration ID
        
        # 2. Create payment record (payment_type removed - it's in Registration)
        new_payment = Payment(
            registration_id=new_registration.id,
            payment_screenshot=file_url,
            status=PaymentStatus.PENDING,
            amount=float(amount),  # Mandatory amount
            payment_method="UPI"  # Always UPI
        )
        db.add(new_payment)
        db.flush()
        
        # 3. Create tickets based on payment type
        tickets_created = []
        if payment_type == "individual":
            # Individual registration: create 1 ticket
            ticket = Ticket(
                registration_id=new_registration.id,
                member_name=name,
                serial_code=Ticket.generate_serial_code(new_registration.id, is_bulk=False)
            )
            db.add(ticket)
            db.flush()
            tickets_created.append(ticket)
            
            # Create attendance record for this ticket
            attendance = Attendance(
                ticket_id=ticket.id,
                checked_in=False
            )
            db.add(attendance)
            
        else:  # bulk
            # Parse members from JSON or CSV
            member_names = []
            if members:
                try:
                    # Try JSON format first
                    member_names = json.loads(members)
                    if not isinstance(member_names, list):
                        member_names = [str(members)]
                except json.JSONDecodeError:
                    # Fall back to CSV
                    member_names = [m.strip() for m in members.split(',') if m.strip()]
            
            # Validate member count for bulk (exactly 4 people)
            if len(member_names) != 4:
                db.rollback()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Bulk registration requires exactly 4 members. Got {len(member_names)} members."
                )
            
            # Create one ticket per member
            for idx, member_name in enumerate(member_names):
                ticket = Ticket(
                    registration_id=new_registration.id,
                    member_name=member_name,
                    serial_code=Ticket.generate_serial_code(new_registration.id, is_bulk=True, member_index=idx)
                )
                db.add(ticket)
                db.flush()
                tickets_created.append(ticket)
                
                # Create attendance record for this ticket
                attendance = Attendance(
                    ticket_id=ticket.id,
                    checked_in=False
                )
                db.add(attendance)
        
        # Commit all changes
        db.commit()
        db.refresh(new_registration)
        
        # 4. Send confirmation email and log it
        try:
            email_sent = await send_pending_confirmation_email(email, name, tickets_created[0].serial_code if tickets_created else "PENDING")
            
            # Log the email in messages table
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
            
        except Exception as e:
            print(f"Warning: Failed to send confirmation email: {str(e)}")
            # Don't fail the registration if email fails
        
        return RegistrationResponse(
            id=new_registration.id,
            name=new_registration.name,
            email=new_registration.email,
            status="pending",
            message="Registration submitted successfully! You will receive a confirmation email shortly. Our team will review your payment and send your ticket within 24-48 hours."
        )
        
    except Exception as e:
        db.rollback()
        # Note: Supabase Storage handles cleanup automatically, no need to delete file
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create registration: {str(e)}"
        )


@router.get("/registration/status/{email}")
async def check_registration_status(email: str, db: Session = Depends(get_db)):
    """
    Check registration status by email
    Returns registration info with ticket count
    """
    registration = db.query(Registration).filter(Registration.email == email).first()
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found with this email"
        )
    
    # Get payment status
    payment = db.query(Payment).filter(Payment.registration_id == registration.id).first()
    payment_status = payment.status.value if payment else "pending"
    
    # Count tickets
    tickets_count = db.query(Ticket).filter(Ticket.registration_id == registration.id).count()
    
    # Get ticket serial codes
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
