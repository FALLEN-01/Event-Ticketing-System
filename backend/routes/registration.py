"""
Registration routes - handles form submissions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional

from database import get_db
from models.registration import Registration, RegistrationStatus

router = APIRouter(prefix="/api/registration", tags=["Registration"])


class RegistrationCreate(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    transaction_id: Optional[str] = None


class RegistrationResponse(BaseModel):
    id: int
    full_name: str
    email: str
    status: str
    message: str

    class Config:
        from_attributes = True


@router.post("/submit", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
async def submit_registration(
    registration: RegistrationCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new event registration
    """
    # Check if email already exists
    existing = db.query(Registration).filter(Registration.email == registration.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new registration
    new_registration = Registration(
        full_name=registration.full_name,
        email=registration.email,
        phone=registration.phone,
        transaction_id=registration.transaction_id,
        status=RegistrationStatus.PENDING
    )
    
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    
    return RegistrationResponse(
        id=new_registration.id,
        full_name=new_registration.full_name,
        email=new_registration.email,
        status=new_registration.status.value,
        message="Registration submitted successfully! You will receive your ticket via email once approved."
    )


@router.get("/check/{email}")
async def check_registration(email: str, db: Session = Depends(get_db)):
    """
    Check registration status by email
    """
    registration = db.query(Registration).filter(Registration.email == email).first()
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    return {
        "email": registration.email,
        "status": registration.status.value,
        "ticket_sent": registration.ticket_sent
    }
