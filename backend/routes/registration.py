from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
import os
from pathlib import Path
import uuid

from database import get_db
from models.registration import Registration, Payment, Attendance, Message, PaymentStatus, PaymentType, MessageType
from utils.email import send_pending_confirmation_email
from utils.storage import upload_payment_screenshot

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
        serial_code = Registration.generate_serial_code()
        new_registration = Registration(
            name=name,
            email=email,
            phone=phone,
            team_name=team_name,
            members=members,
            serial_code=serial_code
        )
        db.add(new_registration)
        db.flush()  # Get the registration ID
        
        # 2. Create payment record
        new_payment = Payment(
            registration_id=new_registration.id,
            payment_screenshot=file_url,
            payment_type=PaymentType.BULK if payment_type == "bulk" else PaymentType.INDIVIDUAL,
            status=PaymentStatus.PENDING
        )
        db.add(new_payment)
        
        # 3. Create attendance record (empty initially)
        new_attendance = Attendance(
            registration_id=new_registration.id,
            checked_in=False
        )
        db.add(new_attendance)
        
        # Commit all changes
        db.commit()
        db.refresh(new_registration)
        
        # 4. Send confirmation email and log it
        try:
            email_sent = await send_pending_confirmation_email(email, name, serial_code)
            
            # Log the email in messages table
            email_log = Message(
                registration_id=new_registration.id,
                message_type=MessageType.CONFIRMATION,
                subject="Event Registration Received - Pending Review",
                body=f"Confirmation email sent to {email}",
                sent=email_sent,
                recipient_email=email,
                has_attachment=False
            )
            if email_sent:
                from datetime import datetime
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
    Joins with Payment table to get approval status
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
    
    return {
        "id": registration.id,
        "name": registration.name,
        "email": registration.email,
        "status": payment_status,
        "serial_code": registration.serial_code,
        "created_at": registration.created_at.isoformat()
    }
