from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.settings import Settings
from pydantic import BaseModel
from typing import Optional


router = APIRouter(prefix="/admin/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    event_name: Optional[str] = None
    event_type: Optional[str] = None
    event_date: Optional[str] = None
    event_time: Optional[str] = None
    event_venue: Optional[str] = None
    event_location: Optional[str] = None
    individual_price: Optional[float] = None
    bulk_price: Optional[float] = None
    bulk_team_size: Optional[int] = None
    currency: Optional[str] = None
    upi_id: Optional[str] = None
    payment_instructions: Optional[str] = None
    organization_name: Optional[str] = None
    support_email: Optional[str] = None
    approval_email_subject: Optional[str] = None
    rejection_email_subject: Optional[str] = None


class SettingsResponse(BaseModel):
    id: int
    event_name: str
    event_type: str
    event_date: str
    event_time: str
    event_venue: str
    event_location: str
    individual_price: float
    bulk_price: float
    bulk_team_size: int
    currency: str
    upi_id: str
    payment_instructions: str
    organization_name: str
    support_email: str
    approval_email_subject: str
    rejection_email_subject: str

    class Config:
        from_attributes = True


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    """
    Get current system settings
    """
    settings = db.query(Settings).first()
    
    if not settings:
        # Create default settings if none exist
        settings = Settings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings


@router.put("", response_model=SettingsResponse)
def update_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db)
):
    """
    Update system settings
    """
    settings = db.query(Settings).first()
    
    if not settings:
        settings = Settings()
        db.add(settings)
    
    # Update only provided fields
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    
    return settings
