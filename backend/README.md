# 🎫 Event Ticketing System Backend

**FastAPI-based RESTful API** with PostgreSQL, Cloudinary storage, JWT authentication, and comprehensive security features.

![Python](https://img.shields.io/badge/python-3.11%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-green)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running Locally](#-running-locally)
- [Docker Deployment](#-docker-deployment)
- [Online Deployment](#-online-deployment)
- [API Endpoints](#-api-endpoints)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### Core Functionality
- 📝 **Registration Management** - Individual and bulk registration with validation
- 💳 **Payment Verification** - Screenshot upload, approve/reject with email notifications
- 🎫 **QR Code Generation** - Unique QR codes hosted on Cloudinary
- 📧 **Email Service** - Brevo API with SMTP fallback
- 🔐 **JWT Authentication** - Secure admin access with HTTP-only cookies
- 🛡️ **Rate Limiting** - IP-based rate limiting with slowapi
- 📊 **Audit Logging** - Complete action tracking with IP and user agent

### Security
- **Input Sanitization** - XSS prevention
- **Security Headers** - CSP, XSS Protection, HSTS, X-Frame-Options
- **Password Hashing** - Bcrypt with 12 rounds
- **CORS Protection** - Whitelisted origins
- **File Validation** - Image type and size checks (5MB max)

### Database
- **14 Tables** - registrations, payment, tickets, attendance, messages, admins, settings, audit_logs
- **PostgreSQL** - Production database
- **SQLite** - Development database
- **SQLAlchemy ORM** - Type-safe database operations

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Framework** | FastAPI | 0.115+ |
| **Database** | PostgreSQL / SQLite | 15+ / 3.x |
| **ORM** | SQLAlchemy | 2.0+ |
| **Storage** | Cloudinary | Latest |
| **Email** | Brevo API / SMTP | Latest |
| **Authentication** | python-jose (JWT) | 3.3+ |
| **Password Hashing** | bcrypt | 4.2+ |
| **QR Codes** | qrcode + Pillow | 8.0 / 11.0 |
| **Rate Limiting** | slowapi | 0.1.9+ |
| **Validation** | Pydantic | 2.10+ |
| **HTTP Client** | httpx | 0.28+ |

---

## 💻 Installation

### 1. Clone Repository

```bash
git clone https://github.com/FALLEN-01/Event-Ticketing-System.git
cd Event-Ticketing-System/backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### Dependencies Overview

```
fastapi[standard]==0.115.7    # Web framework
uvicorn==0.34.0               # ASGI server
sqlalchemy==2.0.37            # ORM
psycopg2-binary==2.9.10       # PostgreSQL adapter
python-multipart==0.0.20      # File uploads
python-jose[cryptography]==3.3.0  # JWT tokens
passlib[bcrypt]==1.7.4        # Password hashing
cloudinary==1.42.0            # Cloud storage
qrcode[pil]==8.0              # QR code generation
Pillow==11.0.0                # Image processing
httpx==0.28.1                 # HTTP client (Brevo API)
slowapi==0.1.9                # Rate limiting
pydantic==2.10.5              # Data validation
pydantic-settings==2.7.1      # Environment variables
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
# PostgreSQL (Production)
DATABASE_URL=postgresql+psycopg2://username:password@host:5432/database_name

# SQLite (Development)
# DATABASE_URL=sqlite:///./event_tickets.db

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo Email API
BREVO_API_KEY=xkeysib-your-api-key-here

# SMTP Fallback (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Configuration
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Event Ticketing System

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=12

# CORS Configuration (comma-separated or JSON array)
CORS_ORIGINS=["http://localhost:5000","http://localhost:5001","https://yourdomain.com"]

# Security Settings
RATE_LIMIT_ENABLED=true

# Server Configuration (Optional)
PORT=8000
HOST=0.0.0.0
```

### Getting Credentials

**Cloudinary:**
1. Sign up at https://cloudinary.com
2. Get credentials from Dashboard → Account Details
3. Copy Cloud Name, API Key, API Secret

**Brevo Email:**
1. Sign up at https://app.brevo.com
2. Navigate to SMTP & API → API Keys
3. Create new API key
4. Copy `xkeysib-...` key

**Gmail SMTP (Fallback):**
1. Enable 2-Step Verification
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use generated password (16 characters)

**PostgreSQL:**
- **Render:** Create PostgreSQL database, copy Internal Database URL
- **Supabase:** Project Settings → Database → Connection String (Direct)
- **Local:** `postgresql+psycopg2://postgres:password@localhost:5432/event_tickets`

---

## 🗄️ Database Setup

### Initialize Database

```bash
python create_tables.py
```

This creates:
- All 14 tables with relationships
- Default admin account (admin@gmail.com / admin123)
- Default settings (event name, dates)

### Database Schema

```
registrations (id, name, email, phone, team_name, payment_type, created_at)
├── payment (registration_id, payment_screenshot, status, amount, approved_by)
├── tickets (registration_id, member_name, serial_code, qr_code, is_active)
│   └── attendance (ticket_id, checked_in, check_in_time)
└── messages (registration_id, email_type, subject, sent_at, status)

admins (id, username, email, password_hash, created_at)
audit_logs (admin_id, registration_id, action, details, ip_address, user_agent)
settings (key, value, updated_at, updated_by)
```

### Migrations

```bash
# Backup database
python -c "from database import Base, engine; from sqlalchemy import MetaData; MetaData().reflect(engine); print('Backup complete')"

# Reset database (CAUTION: Deletes all data)
python -c "from database import Base, engine; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"
```

---

## 🏃 Running Locally

### Development Mode

```bash
uvicorn main:app --reload --port 8000
```

### Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Access Points

- **API Root:** http://localhost:8000
- **Interactive Docs (Swagger):** http://localhost:8000/docs
- **Alternative Docs (ReDoc):** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/health
- **Keep-Alive Ping:** http://localhost:8000/ping

### Testing

```bash
# Test health endpoint
curl http://localhost:8000/health

# Test registration endpoint
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","phone":"1234567890","payment_type":"individual"}'

# Test admin login
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}'
```

---

## 🐳 Docker Deployment

### Using Dockerfile

```bash
# Build image
docker build -t event-backend .

# Run container
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  --name event-backend \
  event-backend

# View logs
docker logs -f event-backend
```

### Using Docker Compose

From project root:

```bash
docker-compose up -d backend
docker-compose logs -f backend
```

### Initialize Database in Docker

```bash
docker exec -it event-backend python create_tables.py
```

---

## 🌐 Online Deployment (Render.com)

### Step 1: Prepare PostgreSQL Database

**Option A: Render PostgreSQL**
1. Create new PostgreSQL database on Render
2. Copy **Internal Database URL**
3. Format: `postgresql+psycopg2://user:pass@host/db`

**Option B: Supabase**
1. Create project at https://supabase.com
2. Go to Project Settings → Database
3. Copy **Connection String (Direct Connection)**
4. Change `postgresql://` to `postgresql+psycopg2://`

### Step 2: Push to GitHub

```bash
git init
git add .
git commit -m "Production ready v1.2"
git branch -M main
git remote add origin https://github.com/FALLEN-01/Event-Ticketing-System.git
git push -u origin main
```

### Step 3: Deploy on Render

1. **Create New Web Service**
   - Connect GitHub repository
   - Select repository: `Event-Ticketing-System`
   - Root Directory: `backend`
   - Environment: Python 3.11

2. **Build Configuration**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

3. **Environment Variables** (Add all from `.env`)
   ```
   DATABASE_URL=postgresql+psycopg2://...
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   BREVO_API_KEY=...
   JWT_SECRET_KEY=...
   CORS_ORIGINS=["https://yourdomain.com","https://admin.yourdomain.com"]
   RATE_LIMIT_ENABLED=true
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Your API: `https://your-app.onrender.com`

### Step 4: Initialize Database

```bash
# Via Render Shell
# Dashboard → Shell → Run:
python create_tables.py
```

### Step 5: Keep-Alive (Free Tier)

Render free tier sleeps after 15 minutes. Use GitHub Actions:

`.github/workflows/keep-alive.yml`:
```yaml
name: Keep Render Alive
on:
  schedule:
    - cron: '*/8 * * * *'  # Every 8 minutes
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl https://your-app.onrender.com/ping
```

---

## 📡 API Endpoints

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/register` | Submit registration | 3/min |
| `GET` | `/api/registration/status/{email}` | Check status | - |
| `GET` | `/api/payment-qr/{qr_type}` | Get payment QR (individual/bulk) | 20/min |
| `GET` | `/` | API information | 10/min |
| `GET` | `/health` | Health check | 30/min |
| `GET` | `/ping` | Keep-alive endpoint | 30/min |

### Admin Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Authenticate admin |
| `POST` | `/api/admin/logout` | Clear JWT cookie |
| `GET` | `/api/admin/registrations` | List registrations (filters: status, payment_type, search) |
| `GET` | `/api/admin/registrations/{id}` | Get registration details |
| `POST` | `/api/admin/registrations/{id}/approve` | Approve payment |
| `POST` | `/api/admin/registrations/{id}/reject` | Reject payment (with reason) |
| `GET` | `/api/admin/stats` | Dashboard statistics |
| `GET` | `/api/admin/settings` | Get app settings |
| `PUT` | `/api/admin/settings` | Update settings |
| `POST` | `/api/admin/settings/upload-qr` | Upload payment QR code |
| `GET` | `/api/admin/audit-logs` | Get audit logs (filters: admin_id, action, registration_id) |
| `POST` | `/api/admin/change-password` | Change admin password |

### Ticket Endpoints (Scanner App)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/verify-ticket/{serial}` | Verify ticket validity |
| `POST` | `/mark-used/{serial}` | Check-in ticket |

### Request Examples

**Register (Individual):**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: multipart/form-data" \
  -F "name=John Doe" \
  -F "email=john@example.com" \
  -F "phone=1234567890" \
  -F "payment_type=individual" \
  -F "payment_screenshot=@payment.jpg"
```

**Admin Login:**
```bash
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin123"}' \
  -c cookies.txt
```

**Get Registrations (Authenticated):**
```bash
curl http://localhost:8000/api/admin/registrations?status=approved \
  -b cookies.txt
```

---

## 🔒 Security Features

### Rate Limiting

| Endpoint | Limit | Scope |
|----------|-------|-------|
| `/api/register` | 3/minute | Per IP |
| `/api/admin/login` | 5/minute | Per IP |
| `/api/payment-qr/*` | 20/minute | Per IP |
| `/health`, `/ping` | 30/minute | Per IP |
| `/` | 10/minute | Per IP |

### Security Headers

```python
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

### Input Sanitization

```python
def sanitize_input(text: str) -> str:
    """Remove XSS characters: <>"'&"""
    dangerous_chars = {'<': '', '>': '', '"': '', "'": '', '&': ''}
    for char, replacement in dangerous_chars.items():
        text = text.replace(char, replacement)
    return text
```

### JWT Configuration

- **Algorithm:** HS256
- **Expiry:** 12 hours
- **Cookie:** HTTP-only, SameSite=Lax
- **Secret:** Minimum 32 characters (environment variable)

### Password Security

- **Hashing:** bcrypt
- **Rounds:** 12
- **Validation:** Minimum 6 characters

---

## 🐛 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Check DATABASE_URL format
# PostgreSQL: postgresql+psycopg2://user:pass@host:5432/db
# SQLite: sqlite:///./event_tickets.db

# Test connection
python -c "from database import engine; engine.connect(); print('OK')"
```

**2. Cloudinary Upload Failed**
```bash
# Verify credentials
python -c "import cloudinary; cloudinary.config(cloud_name='...', api_key='...', api_secret='...'); print('OK')"

# Check file size (max 5MB)
# Check file type (jpg, jpeg, png only)
```

**3. Email Not Sending**
```bash
# Check Brevo API key
# Verify FROM_EMAIL in Brevo sender list
# Test SMTP fallback:
python -c "import smtplib; smtplib.SMTP('smtp.gmail.com', 587).ehlo(); print('OK')"
```

**4. JWT Authentication Failed**
```bash
# Check JWT_SECRET_KEY in .env (minimum 32 chars)
# Clear browser cookies
# Check token expiry (default 12 hours)
```

**5. Rate Limit Exceeded**
```bash
# Wait 60 seconds
# Check RATE_LIMIT_ENABLED=true in .env
# Whitelist IP in slowapi configuration (main.py)
```

**6. CORS Error**
```bash
# Add frontend URL to CORS_ORIGINS in .env
CORS_ORIGINS=["http://localhost:5000","http://localhost:5001","https://yourdomain.com"]
```

### Debug Mode

```bash
# Enable detailed error messages
uvicorn main:app --reload --log-level debug
```

### Logs

```bash
# View logs in Docker
docker logs -f event-backend

# View logs on Render
# Dashboard → Logs tab
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM Tutorial](https://docs.sqlalchemy.org/en/20/tutorial/)
- [Cloudinary Python SDK](https://cloudinary.com/documentation/python_integration)
- [Brevo API Docs](https://developers.brevo.com/)
- [JWT Best Practices](https://jwt.io/introduction)

---

## 📄 License

**MIT License with AI Training Prohibition** - Open source for human developers, closed to AI training systems.

See [LICENSE](../LICENSE) file for complete terms.

---

**Backend v1.2.0** | Production Ready | Last Updated: November 30, 2025
