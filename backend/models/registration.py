"""
Database models for event ticketing system
Production-grade 7-table architecture for individual + bulk registrations
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Enum, DECIMAL
from sqlalchemy.orm import relationship
from datetime import datetime
import secrets
import enum

from database import Base


# ==================== ENUMS ====================

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class PaymentType(str, enum.Enum):
    INDIVIDUAL = "individual"  # Single person registration
    BULK = "bulk"  # Group of 4-5 people


class MessageType(str, enum.Enum):
    CONFIRMATION = "confirmation"
    APPROVAL = "approval"
    REJECTION = "rejection"
    REMINDER = "reminder"


class AdminRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    REVIEWER = "reviewer"


# ==================== TABLE 1: REGISTRATIONS ====================

class Registration(Base):
    """
    Registration table - stores participant or team-level data
    One registration can have multiple tickets (for bulk/team registrations)
    """
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Personal Information
    name = Column(String(255), nullable=False)  # Participant or team leader name
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=False)
    
    # Team Information (Optional)
    team_name = Column(String(255), nullable=True)
    members = Column(Text, nullable=True)  # JSON array of team member names
    
    # Payment Type
    payment_type = Column(Enum(PaymentType), default=PaymentType.INDIVIDUAL, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    payment = relationship("Payment", back_populates="registration", uselist=False, cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="registration", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="registration", cascade="all, delete-orphan")


# ==================== TABLE 2: PAYMENTS ====================

class Payment(Base):
    """
    Payment table - payment record linked to each registration
    """
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), unique=True, nullable=False)
    
    # Payment Information
    payment_screenshot = Column(String(500), nullable=True)  # Supabase Storage URL
    amount = Column(DECIMAL(10, 2), nullable=True)  # Payment amount
    payment_method = Column(String(50), nullable=True)  # UPI, Card, etc.
    payment_type = Column(Enum(PaymentType), default=PaymentType.INDIVIDUAL, nullable=False)
    
    # Approval Status
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    rejection_reason = Column(Text, nullable=True)
    
    # Approval Details
    approved_by = Column(String(255), nullable=True)  # Admin username
    approved_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    registration = relationship("Registration", back_populates="payment")


# ==================== TABLE 3: TICKETS ====================

class Ticket(Base):
    """
    Tickets table - stores one or more QR tickets per registration
    Individual registration: 1 ticket
    Bulk registration: 4-5 tickets (one per team member)
    """
    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=False)
    
    # Ticket Holder Information
    member_name = Column(String(255), nullable=False)  # Person this ticket belongs to
    
    # Ticket Identity
    serial_code = Column(String(50), unique=True, index=True, nullable=False)  # EVT25-000123 or TEAM45-A
    qr_code_path = Column(String(500), nullable=True)  # Supabase Storage URL
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)  # Can be deactivated
    
    # Timestamps
    issued_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    registration = relationship("Registration", back_populates="tickets")
    attendance = relationship("Attendance", back_populates="ticket", uselist=False, cascade="all, delete-orphan")
    
    @staticmethod
    def generate_serial_code(registration_id, is_bulk=False, member_index=0):
        """
        Generate a unique serial code for a ticket
        - Individual: EVT25-000123 format
        - Bulk: TEAM45-A, TEAM45-B, etc. format (based on registration ID and member index)
        """
        if is_bulk:
            # For bulk registrations, use team format with letter suffix
            member_letter = chr(65 + member_index)  # A, B, C, D for indices 0, 1, 2, 3
            return f"TEAM{registration_id:03d}-{member_letter}"
        else:
            # For individual registrations, use EVT format
            year = datetime.now().strftime('%y')
            # Use registration ID padded to 6 digits
            return f"EVT{year}-{registration_id:06d}"


# ==================== TABLE 4: ATTENDANCE ====================

class Attendance(Base):
    """
    Attendance table - tracks check-in/check-out per ticket
    Each ticket has one attendance record
    """
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(Integer, ForeignKey("tickets.id"), unique=True, nullable=False)
    
    # Check-in
    checked_in = Column(Boolean, default=False, nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_in_by = Column(String(255), nullable=True)  # Scanner operator
    
    # Check-out
    checked_out = Column(Boolean, default=False, nullable=False)
    check_out_time = Column(DateTime, nullable=True)
    check_out_by = Column(String(255), nullable=True)  # Scanner operator
    
    # Notes
    notes = Column(Text, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ticket = relationship("Ticket", back_populates="attendance")


# ==================== TABLE 5: MESSAGES ====================

class Message(Base):
    """
    Messages table - logs all outgoing emails/notifications
    """
    __tablename__ = "messages"
    
    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=False)
    
    # Message Details
    message_type = Column(Enum(MessageType), nullable=False)
    subject = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    recipient_email = Column(String(255), nullable=False)
    
    # Attachments
    has_attachment = Column(Boolean, default=False, nullable=False)
    attachment_path = Column(String(500), nullable=True)  # Supabase Storage URL
    
    # Status
    sent = Column(Boolean, default=False, nullable=False)
    sent_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    registration = relationship("Registration", back_populates="messages")


# ==================== TABLE 6: ADMINS ====================

class Admin(Base):
    """
    Admins table - stores admin login credentials & roles
    """
    __tablename__ = "admins"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Credentials
    username = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)  # Bcrypt hash
    name = Column(String(255), nullable=False)
    
    # Role
    role = Column(Enum(AdminRole), default=AdminRole.REVIEWER, nullable=False)
    
    # Status
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    
    # Relationships
    audit_logs = relationship("AuditLog", back_populates="admin", cascade="all, delete-orphan")
    
    def verify_password(self, password: str) -> bool:
        """Verify password against hash"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.verify(password, self.password_hash)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password"""
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)


# ==================== TABLE 7: AUDIT_LOGS ====================

class AuditLog(Base):
    """
    Audit logs table - tracks admin actions for traceability
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=False)
    registration_id = Column(Integer, ForeignKey("registrations.id"), nullable=True)
    
    # Action Details
    action = Column(String(255), nullable=False)  # e.g., "Approved Payment", "Rejected Ticket"
    details = Column(Text, nullable=True)  # JSON or additional context
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    admin = relationship("Admin", back_populates="audit_logs")
    registration = relationship("Registration")
