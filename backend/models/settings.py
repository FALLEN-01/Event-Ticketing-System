from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event Information
    event_name = Column(String, default="IEEE YESS'25")
    event_type = Column(String, default="Conference")
    event_date = Column(String, default="2025-09-20")
    event_time = Column(String, default="09:00")
    event_venue = Column(String, default="Offline")
    event_location = Column(String, default="BWA JHDR, Kattangal, Kerala 673601, India")
    
    # Pricing
    individual_price = Column(Float, default=500.0)
    bulk_price = Column(Float, default=2000.0)
    bulk_team_size = Column(Integer, default=4)
    currency = Column(String, default="INR")
    
    # Payment
    upi_id = Column(String, default="yourupiid@bank")
    payment_instructions = Column(Text, default="1. Scan the QR code\n2. Complete payment using UPI\n3. Take a screenshot\n4. Upload screenshot in registration form")
    
    # Organization
    organization_name = Column(String, default="Event Ticketing System")
    support_email = Column(String, default="support@eventticketing.com")
    
    # Email Templates
    approval_email_subject = Column(String, default="🎉 Registration Confirmed!")
    rejection_email_subject = Column(String, default="❌ Payment Verification Issue")
    
    # Metadata
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
