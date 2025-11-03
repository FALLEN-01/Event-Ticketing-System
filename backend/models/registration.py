"""
Registration model for event attendees
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from datetime import datetime
import enum

from database import Base


class RegistrationStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)
    
    # Payment Information
    transaction_id = Column(String, nullable=True)
    payment_screenshot = Column(String, nullable=True)  # File path
    
    # Status and Timestamps
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.PENDING)
    qr_code = Column(String, nullable=True)  # Path to QR code image
    ticket_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
