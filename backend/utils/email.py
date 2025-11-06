import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email import encoders
import os
from pathlib import Path
from typing import Optional
import httpx
import tempfile


# Email configuration from environment
SMTP_HOST = os.getenv("SMTP_HOST", "smtp-relay.brevo.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)
FROM_NAME = os.getenv("FROM_NAME", "Event Registration System")
USE_TLS = os.getenv("USE_TLS", "True").lower() == "true"
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")


async def send_email_with_attachments(
    to_email: str,
    subject: str,
    html_body: str,
    attachments: Optional[list] = None
) -> bool:
    """
    Send an email with optional attachments
    Handles both local file paths and URLs (Supabase Storage)
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML content of the email
        attachments: List of file paths or URLs to attach
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    if not SMTP_USER or not SMTP_PASSWORD:
        print("ERROR: SMTP credentials not configured in environment variables")
        return False
    
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        message["To"] = to_email
        message["Subject"] = subject
        
        # Add HTML body
        html_part = MIMEText(html_body, "html")
        message.attach(html_part)
        
        # Add attachments if provided
        if attachments:
            for file_source in attachments:
                # Check if it's a URL or local file
                if file_source.startswith(('http://', 'https://')):
                    # Download from URL
                    async with httpx.AsyncClient() as client:
                        response = await client.get(file_source)
                        if response.status_code == 200:
                            filename = file_source.split('/')[-1]
                            file_content = response.content
                            
                            # Determine if it's an image
                            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                                img = MIMEImage(file_content)
                                img.add_header('Content-Disposition', 'attachment', filename=filename)
                                message.attach(img)
                            else:
                                # Generic attachment
                                part = MIMEBase('application', 'octet-stream')
                                part.set_payload(file_content)
                                encoders.encode_base64(part)
                                part.add_header('Content-Disposition', f'attachment; filename={filename}')
                                message.attach(part)
                else:
                    # Local file
                    if os.path.exists(file_source):
                        filename = os.path.basename(file_source)
                        
                        # Determine if it's an image
                        if file_source.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
                            with open(file_source, 'rb') as f:
                                img = MIMEImage(f.read())
                                img.add_header('Content-Disposition', 'attachment', filename=filename)
                                message.attach(img)
                        else:
                            # Generic attachment
                            with open(file_source, 'rb') as f:
                                part = MIMEBase('application', 'octet-stream')
                                part.set_payload(f.read())
                                encoders.encode_base64(part)
                                part.add_header('Content-Disposition', f'attachment; filename={filename}')
                                message.attach(part)
        
        # Send email with appropriate connection method
        if USE_TLS and SMTP_PORT == 587:
            # Use STARTTLS for port 587
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                start_tls=True,
                timeout=30
            )
        else:
            # Use SSL for port 465 or other ports
            await aiosmtplib.send(
                message,
                hostname=SMTP_HOST,
                port=SMTP_PORT,
                username=SMTP_USER,
                password=SMTP_PASSWORD,
                use_tls=True,
                timeout=30
            )
        
        print(f"✅ Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending email to {to_email}: {str(e)}")
        print(f"   SMTP Config: {SMTP_HOST}:{SMTP_PORT}, TLS={USE_TLS}")
        return False
        return False


async def send_approval_email(
    to_email: str,
    name: str,
    serial_code: str,
    qr_code_path: Optional[str] = None,
    team_name: Optional[str] = None,
    qr_code_paths: Optional[list] = None
) -> bool:
    """
    Send approval email with ticket QR code(s)
    Supports single QR (individual) or multiple QRs (bulk)
    
    Args:
        to_email: Recipient email address
        name: Name of the ticket holder
        serial_code: Unique serial code for the first ticket
        qr_code_path: Path to single QR code (for individual registration)
        team_name: Optional team name
        qr_code_paths: List of QR code paths (for bulk registration)
    
    Returns:
        bool: True if email sent successfully
    """
    subject = "🎉 Your Event Registration is Approved!"
    
    team_info = f"<p><strong>Team:</strong> {team_name}</p>" if team_name else ""
    
    # Determine if this is bulk or individual
    is_bulk = qr_code_paths and len(qr_code_paths) > 1
    ticket_count_text = f"<p>You have <strong>{len(qr_code_paths)} tickets</strong> for your team members.</p>" if is_bulk else ""
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .ticket-box {{ background: white; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 10px; text-align: center; }}
            .serial {{ font-size: 24px; font-weight: bold; color: #667eea; margin: 10px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Registration Approved!</h1>
            </div>
            <div class="content">
                <p>Dear {name},</p>
                
                <p>Congratulations! Your event registration has been <strong>approved</strong>.</p>
                
                {team_info}
                {ticket_count_text}
                
                <div class="ticket-box">
                    <h2>Your Event Ticket{'s' if is_bulk else ''}</h2>
                    <p>Reference serial code:</p>
                    <div class="serial">{serial_code}</div>
                    <p style="margin-top: 20px; color: #666;">
                        {'All QR code tickets are attached to this email.' if is_bulk else 'Your QR code ticket is attached to this email.'}
                    </p>
                    <p style="font-size: 14px; color: #999;">
                        {'Each team member needs their own QR code ticket.' if is_bulk else 'Please save the QR code and present it at the event entrance.'}
                    </p>
                </div>
                
                <h3>Important Instructions:</h3>
                <ul>
                    {'<li>Distribute QR codes to each team member</li>' if is_bulk else ''}
                    <li>Save the attached QR code ticket{'s' if is_bulk else ''} on {'your phones' if is_bulk else 'your phone'}</li>
                    <li>Bring printed cop{'ies' if is_bulk else 'y'} or show the QR code on {'phones' if is_bulk else 'your phone'} at entry</li>
                    <li>Arrive at least 30 minutes before the event</li>
                    <li>{'Each serial code is unique - do not share' if is_bulk else 'Your serial code is unique - do not share it'}</li>
                </ul>
                
                <p style="margin-top: 30px;">We look forward to seeing you at the event!</p>
                
                <p>Best regards,<br>
                <strong>Event Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Determine which attachments to use
    if is_bulk and qr_code_paths:
        # Multiple QR codes for bulk registration
        attachments = qr_code_paths
    elif qr_code_path:
        # Single QR code for individual registration
        attachments = [qr_code_path]
    else:
        attachments = []
    
    return await send_email_with_attachments(to_email, subject, html_body, attachments)


async def send_rejection_email(
    to_email: str,
    name: str,
    reason: Optional[str] = None
) -> bool:
    """
    Send rejection email
    
    Args:
        to_email: Recipient email address
        name: Name of the applicant
        reason: Optional reason for rejection
    
    Returns:
        bool: True if email sent successfully
    """
    subject = "Event Registration - Update Required"
    
    reason_text = f"<p><strong>Reason:</strong> {reason}</p>" if reason else ""
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .reason-box {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Event Registration Update</h1>
            </div>
            <div class="content">
                <p>Dear {name},</p>
                
                <p>Thank you for your interest in our event. Unfortunately, we are unable to approve your registration at this time.</p>
                
                {reason_text}
                
                <div class="reason-box">
                    <p><strong>What's next?</strong></p>
                    <ul style="margin: 10px 0;">
                        <li>Please review the information you submitted</li>
                        <li>Contact our support team if you have questions</li>
                        <li>You may resubmit your registration with corrections</li>
                    </ul>
                </div>
                
                <p>If you believe this is an error or have questions, please contact our support team.</p>
                
                <p>Best regards,<br>
                <strong>Event Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email_with_attachments(to_email, subject, html_body)


async def send_pending_confirmation_email(
    to_email: str,
    name: str,
    serial_code: str
) -> bool:
    """
    Send confirmation email after registration submission (pending approval)
    
    Args:
        to_email: Recipient email address
        name: Name of the applicant
        serial_code: Temporary serial code for tracking
    
    Returns:
        bool: True if email sent successfully
    """
    subject = "Event Registration Received - Pending Review"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
            .info-box {{ background: white; border-left: 4px solid #4facfe; padding: 15px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 20px; color: #777; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>✅ Registration Received</h1>
            </div>
            <div class="content">
                <p>Dear {name},</p>
                
                <p>Thank you for registering for our event! We have received your registration and payment information.</p>
                
                <div class="info-box">
                    <p><strong>Registration ID:</strong> {serial_code}</p>
                    <p><strong>Status:</strong> Pending Review</p>
                </div>
                
                <p>Our team is currently reviewing your registration and payment details. You will receive another email within 24-48 hours with:</p>
                <ul>
                    <li>✅ Approval confirmation with your event ticket (QR code)</li>
                    <li>❌ Request for additional information or corrections</li>
                </ul>
                
                <p><strong>What happens next?</strong></p>
                <ol>
                    <li>Our admin team will verify your payment screenshot</li>
                    <li>Once approved, you'll receive your event ticket with QR code</li>
                    <li>Present the QR code at the event entrance</li>
                </ol>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                <strong>Event Team</strong></p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return await send_email_with_attachments(to_email, subject, html_body)
