# Backend API - Event Ticketing System

FastAPI backend with JWT auth, QR codes, and email notifications.

## Features
- User registration with payment screenshot upload
- Admin authentication (JWT + HTTP-only cookies)
- Approve/reject registrations
- QR code ticket generation
- Email notifications (confirmation, approval, rejection)
- PostgreSQL/SQLite support
- Supabase Storage integration

## Tech Stack
- **FastAPI** 0.115+ - Modern Python web framework
- **SQLAlchemy** 2.0+ - ORM with async support
- **PostgreSQL** - Production database
- **Supabase** - File storage
- **PyJWT** - JWT authentication
- **Bcrypt** - Password hashing
- **aiosmtplib** - Async email sending

## Project Structure
```
backend/
 main.py                  # FastAPI app entry
 database.py              # DB connection
 create_tables.py         # DB initialization
 .env                     # Config (create from .env.example)
 requirements.txt
 Dockerfile
 models/
    registration.py      # SQLAlchemy models
 routes/
    registration.py      # Public API
    admin.py             # Admin API
    ticket.py            # Ticket verification
    test.py              # Health checks
 utils/
    email.py             # SMTP email
    qr_generator.py      # QR codes
    storage.py           # Supabase upload
 static/
     qr_codes/
     uploads/
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create .env file:
```env
DATABASE_URL=postgresql+psycopg2://user:pass@host:5432/db
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=app-password
JWT_SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5000","http://localhost:5173"]
```

3. Initialize database:
```bash
python create_tables.py
```

Creates admin: dmin@gmail.com / dmin123

4. Run server:
```bash
uvicorn main:app --reload --port 8000
```

## API Endpoints

### Public
- POST /api/register - Submit registration
- GET /api/registration/status/{email} - Check status

### Admin (Auth Required)
- POST /api/admin/login - Login
- GET /api/admin/registrations - List all
- POST /api/admin/registrations/{id}/approve - Approve
- POST /api/admin/registrations/{id}/reject - Reject
- GET /api/admin/stats - Statistics

### Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database Schema

**Tables**: egistration, payment, 	icket, ttendance, message, dmin

Key relationships:
- Registration  Payment (1:1)
- Registration  Tickets (1:many)
- Ticket  Attendance (1:1)
- Registration  Messages (1:many)

## Environment Variables

**Required:**
- DATABASE_URL - PostgreSQL or SQLite connection
- SUPABASE_URL & SUPABASE_KEY - File storage
- SMTP_* - Email configuration
- JWT_SECRET_KEY - JWT signing key

**Optional:**
- CORS_ORIGINS - Allowed frontend URLs

## Docker

Build:
```bash
docker build -t event-backend .
```

Run:
```bash
docker run -p 8000:8000 --env-file .env event-backend
```

Or use docker-compose from project root.

---
See [Main README](../README.md) for full documentation.
