"""
Settings models - Normalized configuration tables
Split into logical domains for better organization
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from sqlalchemy.sql import func
from database import Base


# ==================== LEGACY SETTINGS TABLE ====================
# Kept for backward compatibility - will be deprecated
class Settings(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Event Information
    event_name = Column(String, default="Event")
    event_type = Column(String, default="")
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
    individual_qr_code = Column(String, default=None)  # URL to individual payment QR
    bulk_qr_code = Column(String, default=None)  # URL to bulk payment QR
    
    # Organization
    organization_name = Column(String, default="Event Ticketing System")
    support_email = Column(String, default="support@eventticketing.com")
    
    # Email Templates
    approval_email_subject = Column(String, default="🎉 Registration Confirmed!")
    rejection_email_subject = Column(String, default="❌ Payment Verification Issue")
    
    # Metadata
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


# ==================== NORMALIZED TABLES (Future) ====================
# These can be migrated to later for better separation of concerns

class EventConfig(Base):
    """Event-specific configuration"""
    __tablename__ = "event_config"
    
    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    event_date = Column(String, nullable=False)
    event_time = Column(String, nullable=False)
    event_venue = Column(String, nullable=False)
    event_location = Column(Text, nullable=False)
    is_active = Column(Integer, default=1)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PricingConfig(Base):
    """Pricing configuration"""
    __tablename__ = "pricing_config"
    
    id = Column(Integer, primary_key=True, index=True)
    individual_price = Column(Float, nullable=False)
    bulk_price = Column(Float, nullable=False)
    bulk_team_size = Column(Integer, nullable=False)
    currency = Column(String(3), default="INR")
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PaymentConfig(Base):
    """Payment method configuration"""
    __tablename__ = "payment_config"
    
    id = Column(Integer, primary_key=True, index=True)
    upi_id = Column(String, nullable=False)
    individual_qr_code = Column(String, nullable=True)
    bulk_qr_code = Column(String, nullable=True)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class OrganizationConfig(Base):
    """Organization details"""
    __tablename__ = "organization_config"
    
    id = Column(Integer, primary_key=True, index=True)
    organization_name = Column(String, nullable=False)
    support_email = Column(String, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EmailTemplateConfig(Base):
    """Email template configuration"""
    __tablename__ = "email_template_config"
    
    id = Column(Integer, primary_key=True, index=True)
    approval_email_subject = Column(String, nullable=False)
    rejection_email_subject = Column(String, nullable=False)
    
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
