# 🎫 Event Ticketing System v1.2

**Complete event management platform** with registration, payment verification, QR ticketing, and mobile check-in scanner.

![Version](https://img.shields.io/badge/version-1.2.0-blue)
![License](https://img.shields.io/badge/license-MIT%20(No%20AI%20Training)-red)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running Locally](#-running-locally)
- [Docker Deployment](#-docker-deployment)
- [Online Deployment](#-online-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Security Features](#-security-features)
- [Troubleshooting](#-troubleshooting)

---

## ✨ Features

### 🎟️ Registration System
- Multi-step registration form (Individual/Bulk registration)
- Payment screenshot upload with validation
- Real-time form validation
- Email confirmation notifications

### 💳 Payment Management
- Payment verification dashboard
- Approve/reject with custom reasons
- Automatic email notifications
- Payment tracking and audit trail
- CSV export of payment records

### 🎫 Ticket System
- Unique QR code generation per ticket
- Cloudinary-hosted QR codes
- Email delivery of tickets
- Bulk registration support (4 members per team)

### 📱 Mobile Scanner (Flutter)
- QR code scanning for check-ins
- Admin authentication
- Offline capability
- Real-time verification

### 🔐 Admin Dashboard
- 10-section management interface
- JWT authentication with HTTP-only cookies
- Role-based access control
- Real-time statistics
- Audit logging with IP tracking
- CSV exports (attendance & participants)
- Payment QR code management

### 📊 Analytics & Reporting
- Registration statistics
- Attendance tracking
- Payment status overview
- Audit trail viewer
- Export to CSV

---

## 🛠️ Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Backend** | FastAPI | 0.115+ |
| **Database** | PostgreSQL (Production) | 15+ |
| | SQLite (Development) | 3.x |
| **Storage** | Cloudinary | Latest |
| **Email** | Brevo API / SMTP | Latest |
| **Frontend** | React 19 + Vite 6 | Latest |
| **Styling** | Tailwind CSS | 3.x |
| **Mobile** | Flutter | 3.x |
| **Authentication** | JWT + Bcrypt | - |
| **QR Codes** | qrcode + Pillow | 8.0 / 11.0 |
| **Security** | slowapi (rate limiting) | Latest |
| **Deployment** | Docker + Render + Vercel | - |

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Registration   │─────▶│   FastAPI       │◀────▶│   PostgreSQL    │
│  Form (React)   │      │   Backend       │      │   Database      │
└─────────────────┘      └─────────────────┘      └─────────────────┘
                                │                          │
                                │                          │
                                ▼                          ▼
                         ┌─────────────┐            ┌──────────┐
                         │  Cloudinary │            │  Brevo   │
                         │   Storage   │            │  Email   │
                         └─────────────┘            └──────────┘
                                │
                    ┌───────────┴───────────┐
                    ▼                       ▼
         ┌──────────────────┐    ┌──────────────────┐
         │  Admin Dashboard │    │ Flutter Scanner  │
         │     (React)      │    │   (Mobile App)   │
         └──────────────────┘    └──────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+ (or SQLite for dev)
- Flutter SDK (for mobile app)
- Git

### Clone Repository

```bash
git clone https://github.com/FALLEN-01/Event-Ticketing-System.git
cd Event-Ticketing-System
```

---

## 💻 Installation

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Edit .env with your credentials (see Environment Setup section)

# Initialize database
python create_tables.py
```

### 2. Frontend Setup

#### Admin Dashboard
```bash
cd frontend/admin-dashboard
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000/api
```

#### Registration Form
```bash
cd frontend/registration-form
npm install
cp .env.example .env
# Edit .env: VITE_API_URL=http://localhost:8000
```

### 3. Flutter App Setup

```bash
cd ticket_scanner
flutter pub get

# Create .env file or configure backend URL in lib/main.dart
# Default: https://event-ticketing-system-devx.onrender.com
```

---

## 🔐 Environment Setup

### Backend `.env` Configuration

```env
# Database (PostgreSQL for production, SQLite for dev)
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database
# Or for local dev: DATABASE_URL=sqlite:///./event_tickets.db

# Cloudinary (File Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Brevo Email API
BREVO_API_KEY=your-brevo-api-key

# SMTP Fallback (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Event Ticketing System

# JWT Authentication
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=12

# CORS Origins (comma-separated)
CORS_ORIGINS=["http://localhost:5000","http://localhost:5001","https://yourdomain.com"]

# Security
RATE_LIMIT_ENABLED=true
```

### Frontend `.env` Files

**Admin Dashboard** (`frontend/admin-dashboard/.env`):
```env
VITE_API_URL=http://localhost:8000/api
```

**Registration Form** (`frontend/registration-form/.env`):
```env
VITE_API_URL=http://localhost:8000
```

### Flutter Configuration

Edit `ticket_scanner/lib/main.dart`:
```dart
final apiBaseUrl = 'https://your-backend-url.com';
// Or use environment variables with flutter_dotenv
```

---

## 🏃 Running Locally

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Admin Dashboard:**
```bash
cd frontend/admin-dashboard
npm run dev
# Access: http://localhost:5001
```

**Terminal 3 - Registration Form:**
```bash
cd frontend/registration-form
npm run dev
# Access: http://localhost:5000
```

**Terminal 4 - Flutter App:**
```bash
cd ticket_scanner
flutter run
```

### Access Points
- 📝 Registration Form: http://localhost:5000
- 🔧 Admin Dashboard: http://localhost:5001
- 📡 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

### Default Admin Credentials
- **Email:** admin@gmail.com
- **Password:** admin123
- ⚠️ **Change immediately after first login!**

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Restart specific service
docker-compose restart backend
```

### Services
- **backend** - FastAPI (port 8000)
- **registration-form** - React (port 5000)
- **admin-dashboard** - React (port 5001)

### Initialize Database (First Time)
```bash
docker exec -it event-backend python create_tables.py
```

---

## 🌐 Online Deployment

### Backend (Render.com)

1. **Create PostgreSQL Database**
   - Use Render PostgreSQL or Supabase
   - Get connection string

2. **Deploy Backend**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Production ready"
   git push origin main
   ```

3. **Render Configuration**
   - Connect GitHub repository
   - Select `backend` directory
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add environment variables from `.env`

4. **Keep-Alive (Optional)**
   - Use GitHub Actions to ping `/ping` every 8 minutes
   - Prevents Render free tier from sleeping

### Frontend (Vercel)

**Admin Dashboard:**
```bash
cd frontend/admin-dashboard
vercel --prod
# Set environment variable: VITE_API_URL=https://your-backend.onrender.com/api
```

**Registration Form:**
```bash
cd frontend/registration-form
vercel --prod
# Set environment variable: VITE_API_URL=https://your-backend.onrender.com
```

### Flutter App

**Build APK:**
```bash
cd ticket_scanner
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

**Install on Device:**
```bash
flutter install
# Or manually transfer APK to device
```

---

## 📁 Project Structure

```
Event-Ticketing-System/
├── backend/                        # FastAPI Backend
│   ├── main.py                     # Application entry
│   ├── database.py                 # DB configuration
│   ├── create_tables.py            # Database initialization
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                  # Backend container
│   ├── .env                        # Environment variables
│   │
│   ├── models/
│   │   └── registration.py         # SQLAlchemy models
│   │
│   ├── routes/
│   │   ├── registration.py         # Public registration API
│   │   ├── admin.py                # Admin management
│   │   ├── ticket.py               # Ticket verification
│   │   ├── settings.py             # App settings
│   │   └── test.py                 # Health checks
│   │
│   ├── utils/
│   │   ├── email.py                # Email service (Brevo/SMTP)
│   │   ├── qr_generator.py         # QR code generation
│   │   ├── storage.py              # Cloudinary integration
│   │   └── audit.py                # Audit logging
│   │
│   └── static/
│       ├── qr_codes/               # Generated QR codes
│       └── uploads/                # Temporary uploads
│
├── frontend/
│   ├── admin-dashboard/            # Admin Panel (React)
│   │   ├── src/
│   │   │   ├── App.jsx             # Main router
│   │   │   ├── config.js           # Axios instance
│   │   │   ├── pages/
│   │   │   │   ├── Auth.jsx        # Login page
│   │   │   │   ├── Dashboard.jsx   # Main dashboard
│   │   │   │   └── Approvals.jsx   # Legacy approval page
│   │   │   └── components/
│   │   │       ├── DashboardOverview.jsx
│   │   │       ├── PaymentsVerification.jsx
│   │   │       ├── AttendanceTracking.jsx
│   │   │       ├── ParticipantsManagement.jsx
│   │   │       ├── TicketsManagement.jsx
│   │   │       ├── EventsManagement.jsx
│   │   │       ├── SettingsPage.jsx
│   │   │       ├── AdminsRoles.jsx
│   │   │       ├── AuditLogs.jsx
│   │   │       └── ProtectedRoute.jsx
│   │   ├── package.json            # v1.2.0
│   │   ├── Dockerfile
│   │   ├── vercel.json             # Vercel config
│   │   └── nginx.conf
│   │
│   └── registration-form/          # Public Form (React)
│       ├── src/
│       │   ├── App.jsx             # Multi-step form
│       │   ├── App.css             # Custom styling
│       │   └── config.js           # API endpoints
│       ├── package.json            # v1.2.0
│       ├── Dockerfile
│       ├── vercel.json
│       └── nginx.conf
│
├── ticket_scanner/                 # Flutter Mobile App
│   ├── lib/
│   │   └── main.dart               # QR scanner + auth
│   ├── assets/
│   │   └── icon.png                # App icon (512x512)
│   ├── pubspec.yaml                # v1.2.0+2
│   └── android/                    # Android config
│
├── docker-compose.yml              # Multi-container setup
├── .gitignore
├── LICENSE
└── README.md                       # This file
```

---

## 📡 API Documentation

### Public Endpoints

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/register` | Submit registration | 3/min |
| `GET` | `/api/registration/status/{email}` | Check status | - |
| `GET` | `/api/payment-qr/{qr_type}` | Get payment QR (individual/bulk) | 20/min |
| `GET` | `/` | API info | 10/min |
| `GET` | `/health` | Health check | 30/min |
| `GET` | `/ping` | Keep-alive | 30/min |

### Admin Endpoints (Auth Required)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/admin/login` | Admin authentication | 5/min |
| `GET` | `/api/admin/registrations` | List registrations (with filters) | - |
| `GET` | `/api/admin/registrations/{id}` | Get details | - |
| `POST` | `/api/admin/registrations/{id}/approve` | Approve registration | - |
| `POST` | `/api/admin/registrations/{id}/reject` | Reject registration | - |
| `GET` | `/api/admin/stats` | Dashboard statistics | - |
| `GET` | `/api/admin/settings` | Get settings | - |
| `PUT` | `/api/admin/settings` | Update settings | - |
| `POST` | `/api/admin/settings/upload-qr` | Upload payment QR | - |

### Ticket Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/verify-ticket/{serial}` | Verify ticket validity |
| `POST` | `/mark-used/{serial}` | Mark ticket as used (check-in) |

### Interactive Documentation
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🗄️ Database Schema

### Tables Overview

```
registrations (main registration data)
├── payment (payment details & status)
├── tickets (QR tickets, 1-4 per registration)
│   └── attendance (check-in tracking)
└── messages (email notifications log)

admins (admin users)
audit_logs (action tracking)
settings (app configuration)
```

### Key Relationships

```sql
-- One-to-One
registrations ←→ payment

-- One-to-Many
registrations ←→ tickets (1 for individual, 4 for bulk)
tickets ←→ attendance
registrations ←→ messages

-- Audit Trail
admins ←→ audit_logs
registrations ←→ audit_logs
```

### Models

**Registration:**
- id, name, email, phone, team_name, members
- payment_type (individual/bulk)
- created_at, updated_at

**Payment:**
- registration_id, payment_screenshot, amount
- status (pending/approved/rejected)
- payment_method, approved_at, approved_by

**Ticket:**
- registration_id, member_name, serial_code
- qr_code (Cloudinary URL), is_active

**Attendance:**
- ticket_id, checked_in, check_in_time

**Audit Log:**
- admin_id, registration_id, action
- details (JSON), ip_address, user_agent
- created_at

---

## 🔒 Security Features

### Authentication
- JWT tokens with 12-hour expiry
- HTTP-only cookies
- Bcrypt password hashing (12 rounds)

### Rate Limiting
- Registration: 3 requests/minute per IP
- Admin login: 5 requests/minute per IP
- Public QR endpoint: 20 requests/minute
- Health checks: 30 requests/minute

### Security Headers
- Content Security Policy (CSP)
- X-XSS-Protection
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### Input Validation
- XSS prevention (sanitizes `<>"'&`)
- Email format validation
- File type restrictions (images only)
- File size limits (5MB max)

### CORS Protection
- Whitelisted origins only
- Credentials allowed for authenticated requests

### Audit Logging
- All admin actions logged
- IP address and user agent tracking
- Detailed action context (JSON)

---

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Failed:**
```bash
# Check DATABASE_URL in .env
# For PostgreSQL: ensure server is running
pg_isready

# For SQLite: check file permissions
ls -la event_tickets.db
```

**Cloudinary Upload Failed:**
```bash
# Verify credentials in .env
# Test connection:
python -c "import cloudinary; cloudinary.config(cloud_name='...', api_key='...', api_secret='...'); print('OK')"
```

**Email Not Sending:**
```bash
# Check Brevo API key
# Verify SMTP credentials (if using SMTP fallback)
# Check FROM_EMAIL is verified in Brevo
```

### Frontend Issues

**API Connection Failed:**
```bash
# Check VITE_API_URL in .env
# Ensure backend is running
curl http://localhost:8000/health

# Check CORS settings in backend
```

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

### Flutter Issues

**QR Scanner Not Working:**
```bash
# Check camera permissions in AndroidManifest.xml
# Verify backend URL is correct
# Test on physical device (emulator cameras can be unreliable)
```

**Build Failed:**
```bash
# Clean and rebuild
flutter clean
flutter pub get
flutter build apk
```

### Docker Issues

**Container Won't Start:**
```bash
# Check logs
docker-compose logs backend

# Verify .env files exist
ls backend/.env frontend/admin-dashboard/.env

# Check port conflicts
netstat -tulpn | grep 8000
```

**Database Connection in Docker:**
```bash
# Use host.docker.internal instead of localhost
DATABASE_URL=postgresql://user:pass@host.docker.internal:5432/db
```

---

## 📚 Additional Resources

### Documentation
- [Backend README](backend/README.md) - FastAPI setup & API details
- [Flutter README](ticket_scanner/README.md) - Mobile app setup
- [API Documentation](http://localhost:8000/docs) - Interactive API docs

### External Services
- [Cloudinary Dashboard](https://cloudinary.com/console)
- [Brevo Dashboard](https://app.brevo.com/)
- [Render Dashboard](https://dashboard.render.com/)
- [Vercel Dashboard](https://vercel.com/dashboard)

### Getting Help
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
- FastAPI Documentation: https://fastapi.tiangolo.com/
- React Documentation: https://react.dev/
- Flutter Documentation: https://docs.flutter.dev/

---

## 📄 License

**MIT License with AI Training Prohibition**

This project is open source and free to use, modify, and distribute for any purpose, including commercial use. However, **use of this software for AI training, machine learning model development, or data mining for AI purposes is strictly prohibited**.

See the [LICENSE](LICENSE) file for complete terms.

---

## 👨‍💻 Author

**FALLEN-01**
- GitHub: [@FALLEN-01](https://github.com/FALLEN-01)
- Repository: [Event-Ticketing-System](https://github.com/FALLEN-01/Event-Ticketing-System)

---

## 🙏 Acknowledgments

- FastAPI for the modern Python web framework
- React & Vite for blazing-fast frontend development
- Flutter for cross-platform mobile development
- Cloudinary for reliable cloud storage
- Brevo for transactional email service
- Tailwind CSS for utility-first styling

---

## 🚀 Project Status

✅  **Version 1.2.0** | Last Updated: November 30, 2025

### Recent Updates
- Production code optimization (removed excess comments)
- Enhanced security (rate limiting, security headers)
- Complete audit logging system
- CSV export functionality
- Auto-refresh payment verification
- Flutter app icon customization
- Version bumped to 1.2.0

---

**Ready to deploy? Follow the deployment sections above for step-by-step guides!**

For questions or issues, please open an issue on GitHub.
