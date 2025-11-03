"""
Registration model for event attendees
Phase 1: Core fields only - no file uploads yet
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from datetime import datetime
import secrets

from database import Base


class Registration(Base):
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    
    # Team Information (Optional)
    team_name = Column(String(255), nullable=True)
    members = Column(Text, nullable=True)  # Comma-separated member names
    
    # Ticket Information
    serial_code = Column(String(50), unique=True, index=True, nullable=False)
    ticket_used = Column(Boolean, default=False, nullable=False)
    
    # Status
    status = Column(String(20), default="pending")  # pending, approved, rejected
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @staticmethod
    def generate_serial_code():
        """Generate a unique 12-character serial code"""
        return secrets.token_hex(6).upper()
