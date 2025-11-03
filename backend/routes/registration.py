"""
Registration routes - Phase 1: Simple form submission
Handles public registration submissions
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from database import get_db
from models.registration import Registration

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
    registration: RegistrationCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a new event registration
    Phase 1: Basic registration without payment or file upload
    """
    # Check if email already exists
    existing = db.query(Registration).filter(Registration.email == registration.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email is already registered for the event"
        )
    
    # Create new registration
    new_registration = Registration(
        name=registration.name,
        email=registration.email,
        phone=registration.phone,
        team_name=registration.team_name,
        members=registration.members,
        serial_code=Registration.generate_serial_code(),
        status="pending"
    )
    
    db.add(new_registration)
    db.commit()
    db.refresh(new_registration)
    
    return RegistrationResponse(
        id=new_registration.id,
        name=new_registration.name,
        email=new_registration.email,
        status=new_registration.status,
        message="Registration submitted successfully! Our team will review and contact you soon."
    )


@router.get("/registration/status/{email}")
async def check_registration_status(email: str, db: Session = Depends(get_db)):
    """
    Check registration status by email
    """
    registration = db.query(Registration).filter(Registration.email == email).first()
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No registration found with this email"
        )
    
    return {
        "id": registration.id,
        "name": registration.name,
        "email": registration.email,
        "status": registration.status,
        "created_at": registration.created_at.isoformat()
    }
