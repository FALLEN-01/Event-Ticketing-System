"""
Email utility for sending tickets
"""
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


async def send_ticket_email(
    recipient_email: str,
    recipient_name: str,
    qr_code_path: str,
    registration_id: int
):
    """
    Send ticket email with QR code attachment
    
    Args:
        recipient_email: Recipient's email address
        recipient_name: Recipient's full name
        qr_code_path: Path to QR code image
        registration_id: Registration ID
    """
    # TODO: Implement actual email sending using SMTP
    # This is a placeholder structure
    
    email_body = f"""
    <html>
    <body>
        <h2>🎉 Your Event Ticket is Ready!</h2>
        <p>Hi {recipient_name},</p>
        <p>Your registration has been approved! Here's your event ticket.</p>
        <p><strong>Ticket ID:</strong> {registration_id}</p>
        <p>Please present this QR code at the venue entrance.</p>
        <img src="cid:qr_code" alt="Ticket QR Code" />
        <p>See you at the event! 🎊</p>
    </body>
    </html>
    """
    
    # Email configuration would go here
    print(f"[EMAIL] Sending ticket to {recipient_email}")
    print(f"[EMAIL] QR Code: {qr_code_path}")
    
    return True
