from fastapi import APIRouter, File, UploadFile, HTTPException, Form, Depends
from typing import Optional
from sqlalchemy.orm import Session
from utils.storage import upload_payment_screenshot, upload_qr_code
from utils.email import (
    send_approval_email, 
    send_rejection_email, 
    send_pending_confirmation_email
)
from database import get_db
from models.registration import Registration, Ticket
import os
from datetime import datetime

router = APIRouter(prefix="/api/test", tags=["Testing"])


@router.get("/")
async def test_root():
    """
    Test endpoint to verify API is working
    """
    return {
        "status": "ok",
        "message": "Test API is working!",
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/database")
async def test_database_connection():
    """
    Test endpoint to check database connection
    """
    try:
        from database import SessionLocal
        from sqlalchemy import text
        db = SessionLocal()
        
        # Try a simple query using SQLAlchemy 2.0 syntax
        result = db.execute(text("SELECT 1")).fetchone()
        db.close()
        
        return {
            "success": True,
            "message": "✅ Database connection successful!",
            "result": result[0] if result else None
        }
    except Exception as e:
        return {
            "success": False,
            "message": f"❌ Database connection failed: {str(e)}"
        }


@router.post("/send-test-email")
async def test_send_email(
    email: str = Form(...),
    email_type: str = Form("approval")
):
    """
    Test endpoint to send various email templates
    
    Args:
        email: Recipient email address
        email_type: Type of email to send (approval, rejection, pending)
    
    Returns:
        Success/failure message
    """
    try:
        # Validate email
        if '@' not in email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Check SMTP configuration
        smtp_user = os.getenv("SMTP_USER")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if not smtp_user or not smtp_password:
            raise HTTPException(
                status_code=500,
                detail="SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD in environment variables."
            )
        
        # Send appropriate email based on type
        if email_type == "approval":
            success = await send_approval_email(
                to_email=email,
                name="Test User",
                serial_code="EVT25-TEST001",
                qr_code_path=None,  # No actual QR for test
                team_name=None
            )
            message_type = "Approval email (with ticket)"
            
        elif email_type == "rejection":
            success = await send_rejection_email(
                to_email=email,
                name="Test User",
                reason="Payment screenshot was unclear. Please resubmit with a clearer image."
            )
            message_type = "Rejection email"
            
        elif email_type == "pending":
            success = await send_pending_confirmation_email(
                to_email=email,
                name="Test User",
                serial_code="EVT25-TEST001"
            )
            message_type = "Pending confirmation email"
            
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid email_type. Use: approval, rejection, or pending"
            )
        
        if success:
            return {
                "success": True,
                "message": f"✅ {message_type} sent successfully to {email}!",
                "email_type": email_type,
                "recipient": email,
                "smtp_user": smtp_user,
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send {message_type}. Check backend logs for details."
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Email test failed: {str(e)}"
        )


@router.get("/list-registrations")
async def list_registrations(db: Session = Depends(get_db)):
    """
    Test endpoint to list all registrations with their serial codes
    
    Returns:
        List of all registrations with basic info
    """
    try:
        registrations = db.query(Registration).all()
        
        result = []
        for reg in registrations:
            ticket_count = db.query(Ticket).filter(Ticket.registration_id == reg.id).count()
            result.append({
                "id": reg.id,
                "serial_code": reg.serial_code,
                "name": reg.name,
                "email": reg.email,
                "status": reg.payment_status,
                "payment_type": reg.payment_type,
                "ticket_count": ticket_count,
                "created_at": reg.created_at.isoformat() if reg.created_at else None
            })
        
        return {
            "success": True,
            "total": len(result),
            "registrations": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list registrations: {str(e)}"
        )


@router.get("/list-tickets")
async def list_tickets(db: Session = Depends(get_db)):
    """
    Test endpoint to list all tickets with their serial codes
    
    Returns:
        List of all tickets with basic info
    """
    try:
        tickets = db.query(Ticket).all()
        
        result = []
        for ticket in tickets:
            registration = db.query(Registration).filter(Registration.id == ticket.registration_id).first()
            result.append({
                "id": ticket.id,
                "serial_code": ticket.serial_code,
                "name": ticket.name,
                "email": ticket.email,
                "registration_serial": registration.serial_code if registration else None,
                "qr_code_path": ticket.qr_code_path,
                "created_at": ticket.created_at.isoformat() if ticket.created_at else None
            })
        
        return {
            "success": True,
            "total": len(result),
            "tickets": result,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list tickets: {str(e)}"
        )


@router.delete("/delete-ticket/{serial_code}")
async def delete_ticket(serial_code: str, db: Session = Depends(get_db)):
    """
    Test endpoint to delete a specific ticket by serial code
    
    Args:
        serial_code: Serial code of the ticket to delete (e.g., EVT25-000003)
    
    Returns:
        Success/failure message
    """
    try:
        ticket = db.query(Ticket).filter(Ticket.serial_code == serial_code).first()
        
        if not ticket:
            raise HTTPException(
                status_code=404,
                detail=f"Ticket with serial code {serial_code} not found"
            )
        
        ticket_id = ticket.id
        db.delete(ticket)
        db.commit()
        
        return {
            "success": True,
            "message": f"✅ Ticket {serial_code} deleted successfully!",
            "deleted_ticket": {
                "id": ticket_id,
                "serial_code": serial_code
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete ticket: {str(e)}"
        )


@router.delete("/delete-registration/{serial_code}")
async def delete_registration(serial_code: str, db: Session = Depends(get_db)):
    """
    Test endpoint to delete a registration and all associated tickets
    
    Args:
        serial_code: Serial code of the registration to delete (e.g., REG-000001)
    
    Returns:
        Success/failure message with count of deleted tickets
    """
    try:
        # Extract registration ID from serial code (REG-000001 -> 1)
        try:
            reg_id = int(serial_code.split('-')[1])
        except (IndexError, ValueError):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid serial code format. Expected REG-XXXXXX, got {serial_code}"
            )
        
        registration = db.query(Registration).filter(Registration.id == reg_id).first()
        
        if not registration:
            raise HTTPException(
                status_code=404,
                detail=f"Registration with serial code {serial_code} not found"
            )
        
        # Count associated tickets before deletion
        registration_id = registration.id
        tickets = db.query(Ticket).filter(Ticket.registration_id == registration_id).all()
        ticket_count = len(tickets)
        name = registration.name
        
        # Delete all associated tickets first (cascade should handle this, but being explicit)
        for ticket in tickets:
            db.delete(ticket)
        
        # Delete registration
        db.delete(registration)
        db.commit()
        
        return {
            "success": True,
            "message": f"✅ Registration {serial_code} and {ticket_count} associated ticket(s) deleted successfully!",
            "deleted_registration": {
                "id": registration_id,
                "serial_code": serial_code,
                "name": name,
                "tickets_deleted": ticket_count
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete registration: {str(e)}"
        )



