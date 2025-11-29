# 🎫 Event Ticketing System

A complete event registration and ticket management system with admin dashboard, public registration form, and mobile ticket scanner.

## 📋 **Table of Contents**

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#️-project-structure)
- [Quick Start with Docker](#-quick-start-with-docker)
- [Manual Installation](#-manual-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Component Documentation](#-component-documentation)
- [Deployment](#-deployment)

---

## ✨ **Features**

### ✅ Implemented Features
- 🎟️ **Event Registration** - Multi-step form with individual/bulk registration
- 💳 **Payment Upload** - Screenshot upload with validation (JPG, PNG, WebP)
- ☁️ **Cloud Storage** - Supabase Storage for payment screenshots
- ✅ **Admin Dashboard** - 10-section dashboard with glassmorphic UI
- 🔐 **JWT Authentication** - Secure admin login with HTTP-only cookies
- 📊 **Real-time Statistics** - Registration counts and status tracking
- 👥 **Approval System** - Approve/reject registrations with reasons
- 🎫 **Ticket Management** - View and manage issued tickets
- 📧 **Email Notifications** - Confirmation and approval emails
- 🔲 **QR Code Generation** - Unique QR codes for each ticket
- 📱 **Mobile Scanner** - Flutter app for ticket verification (in progress)
- 🐳 **Docker Support** - Complete containerization with docker-compose

---

## 🚀 Quick Start with Docker

The fastest way to run the entire application:

### Prerequisites
- Docker & Docker Compose installed
- `.env` files configured in each directory (see Environment Variables section)

### Steps

1. **Clone the repository:**
```bash
git clone https://github.com/FALLEN-01/Event-Ticketing-System.git
cd Event-Ticketing-System
```

2. **Create `.env` files:**
```bash
# Backend
cp backend/.env.example backend/.env

# Registration Form
cp frontend/registration-form/.env.example frontend/registration-form/.env

# Admin Dashboard
cp frontend/admin-dashboard/.env.example frontend/admin-dashboard/.env
```

3. **Configure environment variables** (see [Environment Variables](#-environment-variables) section)

4. **Start all services:**
```bash
docker-compose up -d --build
```

5. **Initialize database** (first time only):
```bash
docker exec -it event-backend python create_tables.py
```

6. **Access the applications:**
- **Registration Form:** http://localhost:5000
- **Admin Dashboard:** http://localhost:5001
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

7. **Stop all services:**
```bash
docker-compose down
```

8. **View logs:**
```bash
docker-compose logs -f
# Or specific service:
docker-compose logs -f backend
```

---

## 🏗️ Project Structure

```
Event-Ticketing-System/
│
├── backend/                              # FastAPI Backend
│   ├── main.py                           # FastAPI app entry point
│   ├── database.py                       # PostgreSQL/SQLite connection
│   ├── create_tables.py                  # Database initialization
│   ├── .env                              # Environment variables (create from .env.example)
│   ├── requirements.txt                  # Python dependencies
│   ├── Dockerfile                        # Backend container config
│   │
│   ├── models/
│   │   └── registration.py               # SQLAlchemy models (Registration, Payment, Ticket, Admin)
│   │
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── registration.py               # Public registration API
│   │   ├── admin.py                      # Admin authentication & management
│   │   ├── ticket.py                     # Ticket verification
│   │   └── test.py                       # Test endpoints
│   │
│   ├── utils/
│   │   ├── email.py                      # Email sending (SMTP)
│   │   ├── qr_generator.py               # QR code generation
│   │   └── storage.py                    # Supabase Storage upload
│   │
│   └── static/
│       ├── qr_codes/                     # Generated QR codes
│       └── uploads/                      # Temporary uploads
│
├── frontend/
│   │
│   ├── admin-dashboard/                  # Admin Panel (React + Vite + Tailwind v3)
│   │   ├── src/
│   │   │   ├── App.jsx                   # Main router
│   │   │   ├── config.js                 # Axios instance with auth
│   │   │   ├── pages/
│   │   │   │   ├── Auth.jsx              # Login page
│   │   │   │   └── Dashboard.jsx         # Main dashboard with sidebar
│   │   │   └── components/
│   │   │       ├── DashboardOverview.jsx # Stats & recent registrations
│   │   │       ├── EventsManagement.jsx
│   │   │       ├── TicketsManagement.jsx
│   │   │       ├── ParticipantsManagement.jsx
│   │   │       ├── AttendanceTracking.jsx
│   │   │       ├── Approvals.jsx         # Two-pane approval interface
│   │   │       ├── PaymentsVerification.jsx
│   │   │       ├── AdminsRoles.jsx
│   │   │       ├── SettingsPage.jsx
│   │   │       ├── AuditLog.jsx
│   │   │       └── ProtectedRoute.jsx    # Auth guard
│   │   ├── .env                          # API URL config (create from .env.example)
│   │   ├── package.json
│   │   ├── postcss.config.cjs            # PostCSS for Tailwind v3
│   │   ├── tailwind.config.js
│   │   ├── Dockerfile
│   │   └── nginx.conf                    # Nginx config for production
│   │
│   └── registration-form/                # Public Registration Form (React + Vite + CSS)
│       ├── src/
│       │   ├── App.jsx                   # Multi-step form (3 steps)
│       │   ├── App.css                   # Custom CSS styling
│       │   └── config.js                 # API endpoints
│       ├── .env                          # API URL config (create from .env.example)
│       ├── package.json
│       ├── Dockerfile
│       └── nginx.conf                    # Nginx config for production
│
├── ticket_scanner/                       # Flutter Mobile Scanner
│   ├── lib/
│   │   └── main.dart                     # QR scanner implementation
│   ├── pubspec.yaml                      # Flutter dependencies
│   └── README.md
│
├── static/                               # Shared static files
│   ├── qr_codes/
│   └── uploads/
│
├── docker-compose.yml                    # Docker orchestration
├── .gitignore
├── LICENSE
└── README.md                             # This file
```

---

## 🛠️ **Manual Installation**

### Prerequisites

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL** or **SQLite** (for database)
- **Git** ([Download](https://git-scm.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/FALLEN-01/Event-Ticketing-System.git
cd Event-Ticketing-System
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Create .env file from example
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows

# Edit .env with your configuration
# Required: DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, SMTP settings
```

**Configure `.env` file:**
```env
# Database (PostgreSQL or SQLite)
DATABASE_URL=postgresql+psycopg2://user:password@localhost:5432/event_tickets
# OR for SQLite: DATABASE_URL=sqlite:///./event_tickets.db

# Supabase Storage (for payment screenshots)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourevent.com
FROM_NAME=Event Ticketing System

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256

# CORS Origins
CORS_ORIGINS=["http://localhost:5000","http://localhost:5173"]
```

**Initialize Database:**
```bash
python create_tables.py
```

This creates:
- Admin user: `admin@gmail.com` / `admin123`
- Database tables: registrations, payments, tickets, attendance, messages, admins

### 3. Frontend Setup

#### Registration Form

```bash
cd frontend/registration-form

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

**Configure `.env`:**
```env
# Backend API URL
VITE_API_URL=http://localhost:8000
```

#### Admin Dashboard

```bash
cd frontend/admin-dashboard

# Install dependencies
npm install

# Create .env file
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

**Configure `.env`:**
```env
# Backend API URL (with /api suffix)
VITE_API_URL=http://localhost:8000/api
```

### 4. Flutter Scanner Setup (Optional)

```bash
cd ticket_scanner

# Get Flutter dependencies
flutter pub get

# Run on connected device/emulator
flutter run
```

---

## 🚀 **Running the Application**

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access:
- Registration Form: http://localhost:5000
- Admin Dashboard: http://localhost:5001
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Manual Development

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Registration Form:**
```bash
cd frontend/registration-form
npm run dev
# Runs on http://localhost:5000
```

**Terminal 3 - Admin Dashboard:**
```bash
cd frontend/admin-dashboard
npm run dev
# Runs on http://localhost:5173
```

**Terminal 4 - Flutter Scanner (Optional):**
```bash
cd ticket_scanner
flutter run
```

---

## 📡 **API Documentation**

Once the backend is running, visit:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### API Endpoints

#### **Public Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/registration/submit` | Submit new registration |
| `GET` | `/api/registration/check/{email}` | Check registration status |

#### **Admin Endpoints** (Authentication Required - Phase 3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/registrations` | List all registrations with optional status filter |
| `PATCH` | `/api/admin/registrations/{id}/approve` | Approve a registration |
| `PATCH` | `/api/admin/registrations/{id}/reject` | Reject a registration |

---

## 📋 **Development Phases**

### ✅ Phase 1: Basic Form Submission (Current)
- [x] Backend structure created
- [ ] Create registration form UI
- [ ] Form submission without file upload
- [ ] Database storage

### Phase 2: File Upload
- [ ] Payment screenshot upload
- [ ] File validation and storage

### Phase 3: Admin Dashboard
- [ ] View all registrations
- [ ] Approve/reject functionality
- [ ] Export to CSV/Excel

### Phase 4: QR Code & Email
- [ ] Generate QR code tickets
- [ ] Email ticket delivery
- [ ] Ticket verification

### Phase 5: Mobile Scanner
- [ ] Flutter QR scanner
- [ ] Real-time verification
- [ ] Entry logging

### Phase 6: Payment Integration
- [ ] Payment gateway (Razorpay/Stripe)
- [ ] Automatic payment verification

---

## 🛠️ **Tech Stack**

| Component           | Technology                   | Version |
| ------------------- | ---------------------------- | ------- |
| Backend API         | FastAPI                      | 0.115+  |
| Database            | SQLite (dev) / PostgreSQL (prod) | - |
| ORM                 | SQLAlchemy                   | 2.0+    |
| Frontend            | React 18 + Vite              | Latest  |
| Styling             | Tailwind CSS                 | 3.x     |
| HTTP Client         | Axios                        | Latest  |
| Routing             | React Router DOM             | Latest  |
| Mobile App          | Flutter                      | Latest  |
| QR Generation       | Python qrcode                | 8.0+    |
| Image Processing    | Pillow                       | 11.0+   |
| Email               | aiosmtplib                   | 5.0+    |
| Authentication      | PyJWT                        | 2.10+   |
| Password Hashing    | Passlib + Bcrypt             | Latest  |
| Deployment          | Docker + Docker Compose      | -       |

---

## 🔐 **Environment Variables**

### Backend `.env` Configuration

All configuration is done via `.env` files. **Never commit `.env` files** - they contain secrets!

**Location:** `backend/.env`

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL (Production)
DATABASE_URL=postgresql+psycopg2://user:password@host:5432/database

# SQLite (Development/Testing)
# DATABASE_URL=sqlite:///./event_tickets.db

# ============================================
# SUPABASE STORAGE (File Uploads)
# ============================================
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# ============================================
# EMAIL CONFIGURATION (SMTP)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password  # Gmail: Use App Password, not regular password
FROM_EMAIL=noreply@yourevent.com
FROM_NAME=Event Ticketing System

# ============================================
# JWT AUTHENTICATION
# ============================================
JWT_SECRET_KEY=your-very-secret-key-change-in-production
JWT_ALGORITHM=HS256

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGINS=[\"http://localhost:5000\",\"http://localhost:5173\",\"http://localhost:5001\"]
```

### Frontend `.env` Configuration

**Registration Form:** `frontend/registration-form/.env`
```env
VITE_API_URL=http://localhost:8000
```

**Admin Dashboard:** `frontend/admin-dashboard/.env`
```env
VITE_API_URL=http://localhost:8000/api
```

### Production Environment Variables

For deployed environments, update URLs:

```env
# Production Backend
VITE_API_URL=https://your-backend.onrender.com
# or
VITE_API_URL=https://your-backend.onrender.com/api
```

**Important Notes:**
- Gmail SMTP requires [App Password](https://support.google.com/accounts/answer/185833)
- Supabase credentials from [Supabase Dashboard](https://supabase.com/dashboard)
- Change `JWT_SECRET_KEY` for production deployments
- Add production URLs to `CORS_ORIGINS`

---

## 📚 **Component Documentation**

For detailed documentation on each component, see:

- **Backend API**: [backend/README.md](backend/README.md)
  - FastAPI setup, Supabase PostgreSQL configuration
  - API endpoints, database schema
  - Deployment guide, troubleshooting

- **Flutter Scanner App**: [ticket_scanner/README.md](ticket_scanner/README.md)
  - Mobile scanner setup and configuration
  - QR code scanning implementation
  - Building and deploying the mobile app

- **Registration Form**: [frontend/registration-form/README.md](frontend/registration-form/README.md)
  - React + Vite setup
  - Form fields and validation
  - API integration

- **Admin Dashboard**: [frontend/admin-dashboard/README.md](frontend/admin-dashboard/README.md)
  - Tailwind CSS v4 configuration
  - Dashboard features
  - Admin panel setup

---

## 🚀 **Deployment**

### Production Deployment

**Backend**: Deployed on Render
- URL: https://event-ticketing-system-devx.onrender.com
- Database: Supabase PostgreSQL (Session Pooler for IPv4 compatibility)
- Keep-Alive: GitHub Actions workflow pings `/ping` every 8 minutes

**Frontend**: To be deployed on Vercel/Netlify
- Registration Form: TBD
- Admin Dashboard: TBD

**Mobile App**: Built and deployed to Android device (RMX3081)

---

## 🐳 **Docker Deployment** (Optional)

For local production testing with Docker:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

This will start:
- Backend API on port 8000
- PostgreSQL database on port 5432
- Registration form on port 5173
- Admin dashboard on port 5174

---

## 🧪 **Testing**

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend/registration-form
npm test

cd ../admin-dashboard
npm test
```

---

## 📁 **Project Files Overview**

```
Key Files:
├── backend/main.py                    # FastAPI application entry
├── backend/database.py                # Database configuration
├── backend/models/registration.py     # Registration data model
├── backend/routes/registration.py     # Public API endpoints
├── backend/routes/admin.py            # Admin API endpoints
├── backend/utils/qr_generator.py      # QR code generation
├── backend/utils/email.py             # Email sending utility
├── frontend/registration-form/        # Public form (React + Vite)
├── frontend/admin-dashboard/          # Admin panel (React + Vite)
├── ticket_scanner/                    # Mobile scanner app
└── docker-compose.yml                 # Container orchestration
```

---

## 🤝 **Contributing**

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 **Author**

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

---

## 🙏 **Acknowledgments**

- FastAPI for the amazing Python web framework
- Vite for the blazing-fast build tool
- Tailwind CSS for utility-first styling
- Flutter team for cross-platform mobile development

---

## 📞 **Support**

If you have any questions or run into issues:

1. Check the [API Documentation](http://localhost:8000/docs) (when backend is running)
2. Review the individual README files in each subdirectory
3. Open an issue on GitHub
4. Contact the development team

---

---

## 📋 Database Schema

### 6 Tables

1. **registration** - User registration data
2. **payment** - Payment tracking & screenshots
3. **ticket** - Generated tickets with QR codes
4. **attendance** - Check-in tracking
5. **message** - Email notification logs
6. **admin** - Admin users with bcrypt passwords

### Relationships

```
registration (1) ←→ (1) payment
registration (1) ←→ (N) tickets
ticket (1) ←→ (1) attendance
registration (1) ←→ (N) messages
```

---

## 🔐 Default Credentials

**Admin Login:**
- Email: `admin@gmail.com`
- Password: `admin123`

⚠️ **Change password after first login!**

---

## 🌐 API Endpoints

### Public
- `POST /api/register` - Submit registration
- `GET /api/registration/status/{email}` - Check status

### Admin (Auth Required)
- `POST /api/admin/login` - Login
- `GET /api/admin/registrations` - List all
- `GET /api/admin/registrations/{id}` - Get details
- `POST /api/admin/registrations/{id}/approve` - Approve
- `POST /api/admin/registrations/{id}/reject` - Reject
- `GET /api/admin/stats` - Statistics

### Health
- `GET /` - API info
- `GET /health` - Health check
- `GET /ping` - Keep-alive

---

## 🐳 Docker Configuration

### docker-compose.yml

Orchestrates 3 services:
1. **backend** - FastAPI (port 8000)
2. **registration-form** - React (port 5000)
3. **admin-dashboard** - React (port 5001)

### Features
- Uses `.env` files for all configuration
- Health checks for backend
- Dependency management (frontends wait for backend)
- Volume mounts for development
- Bridge network for inter-service communication

### Commands
```bash
docker-compose up -d --build      # Start all
docker-compose logs -f            # View logs
docker-compose down               # Stop all
docker-compose restart backend    # Restart service
```

---

## ✅ Implementation Status

### ✅ Completed
- Backend API with all endpoints
- PostgreSQL database with 6 tables
- Supabase Storage integration
- JWT authentication
- Admin dashboard (10 sections)
- Registration form (multi-step)
- Email notifications
- QR code generation
- Ticket management
- Docker deployment
- Complete documentation

### 🔄 In Progress
- Mobile scanner app (Flutter)
- PDF ticket generation
- Advanced analytics

---

## 🔧 Troubleshooting

### Common Issues

**Backend won't start:**
- Check `.env` file exists and is configured
- Verify database connection string
- Ensure Supabase credentials are correct

**Frontend shows blank page:**
- Check `VITE_API_URL` in `.env`
- Ensure backend is running
- Check browser console for errors

**Docker build fails:**
- Ensure all `.env` files exist
- Check Docker daemon is running
- Verify network connectivity

**Email not sending:**
- Use Gmail App Password, not regular password
- Enable 2-factor authentication
- Check SMTP settings in backend `.env`

---

## 📚 Additional Resources

- **Swagger UI:** http://localhost:8000/docs (when running)
- **ReDoc:** http://localhost:8000/redoc (when running)
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833

---

## 👤 Author

**FALLEN-01**
- GitHub: [@FALLEN-01](https://github.com/FALLEN-01)

---

**Ready to start? Run the applications and visit:**
- 🌐 Registration Form: http://localhost:5000
- 🔧 Admin Dashboard: http://localhost:5001
- 📡 API Backend: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

**Project Status:** ✅ Production Ready | v1.0.0 | All configuration via `.env` files only!
