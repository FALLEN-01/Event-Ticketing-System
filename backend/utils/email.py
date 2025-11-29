import aiosmtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.mime.base import MIMEBase
from email import encoders
import os
from typing import Optional
import httpx
import base64
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from sqlalchemy.orm import Session
from database import SessionLocal
from models.settings import Settings


def get_event_settings() -> dict:
    """
    Fetch event settings from database
    Returns default values if settings not found
    """
    db = SessionLocal()
    try:
        settings = db.query(Settings).first()
        if not settings:
            # Return defaults if no settings found
            return {
                'event_name': "IEEE YESS'25",
                'event_date': "20 September 2025",
                'event_time': "09:00 am",
                'event_venue': "Offline",
                'event_location': "BWA JHDR, Kattangal, Kerala 673601, India",
                'organization_name': "Event Ticketing System",
                'support_email': "support@eventticketing.com",
                'approval_email_subject': "🎉 Registration Confirmed!"
            }
        
        # Format date and time
        from datetime import datetime
        try:
            date_obj = datetime.strptime(settings.event_date, '%Y-%m-%d')
            formatted_date = date_obj.strftime('%d %B %Y')
        except:
            formatted_date = settings.event_date
        
        # Format time
        try:
            time_obj = datetime.strptime(settings.event_time, '%H:%M')
            formatted_time = time_obj.strftime('%I:%M %p')
        except:
            formatted_time = settings.event_time
        
        return {
            'event_name': settings.event_name,
            'event_date': formatted_date,
            'event_time': formatted_time,
            'event_venue': settings.event_venue,
            'event_location': settings.event_location,
            'organization_name': settings.organization_name,
            'support_email': settings.support_email,
            'approval_email_subject': settings.approval_email_subject
        }
    finally:
        db.close()


async def get_base64_image(file_source: str) -> Optional[str]:
    """
    Convert image to base64 for inline embedding in emails
    
    Args:
        file_source: URL or local file path
    
    Returns:
        Base64 encoded image string with data URI prefix
    """
    try:
        if file_source.startswith(('http://', 'https://')):
            # Download from URL
            async with httpx.AsyncClient() as client:
                response = await client.get(file_source)
                if response.status_code == 200:
                    image_data = base64.b64encode(response.content).decode()
                    # Detect image type from extension
                    ext = file_source.split('.')[-1].lower()
                    mime_type = f'image/{ext}' if ext in ['png', 'jpg', 'jpeg', 'gif'] else 'image/png'
                    return f'data:{mime_type};base64,{image_data}'
        else:
            # Local file
            if os.path.exists(file_source):
                with open(file_source, 'rb') as f:
                    image_data = base64.b64encode(f.read()).decode()
                    ext = file_source.split('.')[-1].lower()
                    mime_type = f'image/{ext}' if ext in ['png', 'jpg', 'jpeg', 'gif'] else 'image/png'
                    return f'data:{mime_type};base64,{image_data}'
    except Exception as e:
        print(f'⚠️ Failed to encode image {file_source}: {str(e)}')
    return None


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
    Send an email with optional attachments using Brevo API
    Falls back to SMTP if Brevo API key is not configured
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_body: HTML content of the email
        attachments: List of file paths or URLs to attach
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    # Try Brevo API first (works on Render)
    if BREVO_API_KEY:
        try:
            return await send_via_brevo_api(to_email, subject, html_body, attachments)
        except Exception as e:
            print(f"⚠️ Brevo API failed, trying SMTP fallback: {str(e)}")
    
    # Fallback to SMTP (for local development)
    return await send_via_smtp(to_email, subject, html_body, attachments)


async def send_via_brevo_api(
    to_email: str,
    subject: str,
    html_body: str,
    attachments: Optional[list] = None
) -> bool:
    """Send email using Brevo API (works on Render)"""
    try:
        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = BREVO_API_KEY
        
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
        
        # Prepare email
        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            to=[{"email": to_email}],
            sender={"name": FROM_NAME, "email": FROM_EMAIL},
            subject=subject,
            html_content=html_body
        )
        
        # Handle attachments
        if attachments:
            attachment_list = []
            for file_source in attachments:
                try:
                    # Check if it's a URL or local file
                    if file_source.startswith(('http://', 'https://')):
                        # Download from URL
                        async with httpx.AsyncClient() as client:
                            response = await client.get(file_source)
                            if response.status_code == 200:
                                filename = file_source.split('/')[-1]
                                file_content = base64.b64encode(response.content).decode()
                                attachment_list.append({
                                    "name": filename,
                                    "content": file_content
                                })
                    else:
                        # Local file
                        if os.path.exists(file_source):
                            filename = os.path.basename(file_source)
                            with open(file_source, 'rb') as f:
                                file_content = base64.b64encode(f.read()).decode()
                                attachment_list.append({
                                    "name": filename,
                                    "content": file_content
                                })
                except Exception as e:
                    print(f"⚠️ Failed to attach {file_source}: {str(e)}")
            
            if attachment_list:
                send_smtp_email.attachment = attachment_list
        
        # Send email
        api_response = api_instance.send_transac_email(send_smtp_email)
        print(f"✅ Email sent via Brevo API to {to_email} (Message ID: {api_response.message_id})")
        return True
        
    except ApiException as e:
        print(f"❌ Brevo API error: {e}")
        return False
    except Exception as e:
        print(f"❌ Error sending via Brevo API: {str(e)}")
        return False


async def send_via_smtp(
    to_email: str,
    subject: str,
    html_body: str,
    attachments: Optional[list] = None
) -> bool:
    """
    Send email via SMTP (fallback for local development)
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
    Send approval email with ticket QR code(s) - Modern dark theme design inspired by Snaptiqz
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
    # Fetch settings from database
    event_settings = get_event_settings()
    subject = event_settings['approval_email_subject']
    
    # Determine if this is bulk or individual
    is_bulk = qr_code_paths and len(qr_code_paths) > 1
    
    # Event details from database
    event_name = event_settings['event_name']
    event_date = f"{event_settings['event_date']} • {event_settings['event_time']}"
    event_venue = event_settings['event_venue']
    event_location = event_settings['event_location']
    organization_name = event_settings['organization_name']
    support_email = event_settings['support_email']
    ticket_type = f"{event_name} {f'({len(qr_code_paths)} tickets)' if is_bulk else ''}"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{ 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                color: #ffffff;
                line-height: 1.6;
                padding: 20px;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background: #1e1e2e;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            }}
            .header {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 40px 30px;
                text-align: center;
            }}
            .logo {{
                width: 80px;
                height: 80px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                border-radius: 20px;
                margin: 0 auto 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 40px;
            }}
            .header h1 {{
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
                color: #ffffff;
            }}
            .header p {{
                font-size: 16px;
                color: #e0e0e0;
            }}
            .content {{
                padding: 30px;
            }}
            .event-card {{
                background: #252538;
                border-radius: 12px;
                padding: 25px;
                margin: 20px 0;
            }}
            .event-title {{
                font-size: 24px;
                font-weight: 700;
                color: #ffd700;
                margin-bottom: 20px;
            }}
            .event-detail {{
                display: flex;
                align-items: flex-start;
                margin: 15px 0;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }}
            .event-detail:last-child {{
                border-bottom: none;
            }}
            .icon {{
                width: 24px;
                height: 24px;
                margin-right: 15px;
                flex-shrink: 0;
            }}
            .detail-content {{
                flex: 1;
            }}
            .detail-label {{
                font-size: 12px;
                color: #888;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
            }}
            .detail-value {{
                font-size: 16px;
                color: #ffffff;
                font-weight: 500;
            }}
            .ticket-card {{
                background: #1a1a2e;
                border: 2px solid #667eea;
                border-radius: 16px;
                padding: 30px;
                margin: 25px 0;
                text-align: center;
            }}
            .ticket-title {{
                font-size: 20px;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 20px;
            }}
            .qr-placeholder {{
                width: 200px;
                height: 200px;
                margin: 20px auto;
                background: #ffffff;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                color: #666;
            }}
            .serial-code {{
                font-size: 18px;
                font-weight: 700;
                color: #ffd700;
                letter-spacing: 2px;
                margin: 15px 0;
            }}
            .ticket-instruction {{
                font-size: 14px;
                color: #aaa;
                margin-top: 15px;
            }}
            .attendee-info {{
                background: #252538;
                border-radius: 12px;
                padding: 20px;
                margin: 20px 0;
            }}
            .info-row {{
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }}
            .info-row:last-child {{
                border-bottom: none;
            }}
            .info-label {{
                color: #888;
                font-size: 14px;
            }}
            .info-value {{
                color: #ffffff;
                font-weight: 500;
                font-size: 14px;
            }}
            .notes-section {{
                background: rgba(102, 126, 234, 0.1);
                border-left: 4px solid #667eea;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
            }}
            .notes-title {{
                font-size: 16px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 15px;
            }}
            .notes-section ul {{
                list-style: none;
                padding: 0;
            }}
            .notes-section li {{
                padding: 8px 0;
                padding-left: 25px;
                position: relative;
                font-size: 14px;
                color: #ccc;
            }}
            .notes-section li:before {{
                content: "•";
                position: absolute;
                left: 0;
                color: #667eea;
                font-weight: bold;
                font-size: 20px;
            }}
            .footer {{
                background: #1a1a2e;
                padding: 30px;
                text-align: center;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }}
            .footer-brand {{
                font-size: 20px;
                font-weight: 700;
                color: #667eea;
                margin-bottom: 10px;
            }}
            .footer-tagline {{
                font-size: 12px;
                color: #888;
                margin-bottom: 15px;
            }}
            .footer-contact {{
                font-size: 11px;
                color: #666;
            }}
            .footer-contact a {{
                color: #667eea;
                text-decoration: none;
            }}
            .download-btn {{
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #ffffff;
                padding: 12px 30px;
                border-radius: 8px;
                text-decoration: none;
                display: inline-block;
                margin: 15px 0;
                font-weight: 600;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <div class="logo">🎓</div>
                <h1>Registration Confirmed!</h1>
                <p>You're all set for {event_name}</p>
            </div>
            
            <!-- Content -->
            <div class="content">
                <!-- Event Details Card -->
                <div class="event-card">
                    <div class="event-title">{event_name}</div>
                    
                    <div class="event-detail">
                        <div class="icon">📅</div>
                        <div class="detail-content">
                            <div class="detail-label">Date & Time</div>
                            <div class="detail-value">{event_date}</div>
                        </div>
                    </div>
                    
                    <div class="event-detail">
                        <div class="icon">📍</div>
                        <div class="detail-content">
                            <div class="detail-label">Venue</div>
                            <div class="detail-value">{event_venue}</div>
                        </div>
                    </div>
                    
                    <div class="event-detail">
                        <div class="icon">🗺️</div>
                        <div class="detail-content">
                            <div class="detail-label">Location</div>
                            <div class="detail-value">{event_location}</div>
                        </div>
                    </div>
                    
                    <div class="event-detail">
                        <div class="icon">🎫</div>
                        <div class="detail-content">
                            <div class="detail-label">Ticket Type</div>
                            <div class="detail-value">{ticket_type}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Digital Ticket -->
                <div class="ticket-card">
                    <div class="ticket-title">Your Digital Ticket</div>
                    <div style="width: 280px; height: 280px; margin: 20px auto; background: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; padding: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <img src="QR_CODE_PLACEHOLDER" alt="Ticket QR Code" style="max-width: 100%; max-height: 100%; width: auto; height: auto; display: block; margin: auto;" />
                    </div>
                    <div class="serial-code">{serial_code}</div>
                    <div class="ticket-instruction">
                        Show this QR code at the venue
                    </div>
                </div>
                
                <!-- Attendee Info -->
                <div class="attendee-info">
                    <div class="info-row">
                        <span class="info-label">ATTENDEE: </span>
                        <span class="info-value">{name}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">EMAIL: </span>
                        <span class="info-value">{to_email}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">TICKET ID: </span>
                        <span class="info-value">{serial_code}</span>
                    </div>
                    {f'<div class="info-row"><span class="info-label">TEAM: </span><span class="info-value">{team_name}</span></div>' if team_name else ''}
                
                <!-- Important Notes -->
                <div class="notes-section">
                    <div class="notes-title">📋 Important Notes</div>
                    <ul>
                        <li>Please arrive 30 minutes early</li>
                        {'<li>Ensure each team member has their individual QR code</li>' if is_bulk else '<li>Screenshots of the QR code are acceptable</li>'}
                        <li>Bring a valid ID proof</li>
                        {'<li>Check the attached PDF for all team tickets</li>' if is_bulk else '<li>Keep the QR code safe - it is your entry pass!</li>'}
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div class="footer-brand">{organization_name}</div>
                <div class="footer-tagline">Your vision, our platform, unforgettable events.</div>
                <div class="footer-contact">
                    Need help? Contact us at <a href="mailto:{support_email}">{support_email}</a><br>
                    © 2025 {organization_name}. All rights reserved.
                </div>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Encode QR code to base64 and embed inline
    qr_base64 = None
    if qr_code_path:
        qr_base64 = await get_base64_image(qr_code_path)
    elif is_bulk and qr_code_paths and len(qr_code_paths) > 0:
        # Use first QR for preview in email body
        qr_base64 = await get_base64_image(qr_code_paths[0])
    
    # Replace placeholder with actual base64 QR code or fallback message
    if qr_base64:
        html_body = html_body.replace('QR_CODE_PLACEHOLDER', qr_base64)
    else:
        html_body = html_body.replace('<img src="QR_CODE_PLACEHOLDER"', '<div style="color: #666; font-size: 14px;">[QR Code will be attached]</div><img style="display:none;" src=""')
    
    # Still attach QR codes for download (especially for bulk)
    attachments = []
    if is_bulk and qr_code_paths:
        attachments = qr_code_paths
    elif qr_code_path:
        attachments = [qr_code_path]
    
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
