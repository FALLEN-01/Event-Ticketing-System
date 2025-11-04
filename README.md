# 🎫 Event Ticket System

A complete event registration and ticket management system with web and mobile interfaces.

---

## 📋 **Table of Contents**

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#️-project-structure)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Development Phases](#-development-phases)
- [Environment Variables](#-environment-variables)
- [Component Documentation](#-component-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ **Features**

- 🎟️ **Event Registration** - User-friendly form for event sign-ups
- 💳 **Payment Integration** - Upload payment screenshots (Phase 2)
- ✅ **Admin Approval System** - Review and approve/reject registrations
- 📧 **Email Tickets** - Automatic ticket delivery via email (Phase 4)
- 🔲 **QR Code Generation** - Unique QR codes for each ticket
- 📱 **Mobile Scanner** - Flutter app for ticket verification
- 📊 **Dashboard Analytics** - View registration statistics
- 🔒 **Secure Authentication** - Admin-only access control

---

## 🏗️ Project Structure

```
event-ticket-system/
│
├── backend/                              # FastAPI backend (core API + DB)
│   ├── main.py                           # FastAPI application entry
│   ├── database.py                       # Database configuration
│   ├── routes/                           # API endpoints
│   │   ├── registration.py               # User registration
│   │   └── admin.py                      # Admin management
│   ├── models/                           # Database models
│   │   └── registration.py               # Registration model
│   ├── utils/                            # Utilities
│   │   ├── email.py                      # Email sending
│   │   └── qr_generator.py               # QR code generation
│   ├── static/uploads/                   # File uploads
│   └── requirements.txt                  # Python dependencies
│
├── frontend/                             # React web applications
│   ├── registration-form/                # Public registration form (Vite + React)
│   └── admin-dashboard/                  # Admin panel (Vite + React)
│
└── ticket_scanner/                       # Mobile ticket scanner (Flutter)
    └── lib/
```

---

## 🛠️ **Installation**

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Flutter SDK** (for mobile app) ([Install Guide](https://flutter.dev/docs/get-started/install))
- **Git** ([Download](https://git-scm.com/))

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/event-ticket-system.git
cd event-ticket-system
```

### Step 2: Backend Setup

```bash
cd backend

# Install Python dependencies (no venv needed if installing globally)
py -m pip install -r requirements.txt

# Create environment file
copy .env.example .env

# Edit .env with your configuration (SMTP, database, etc.)

# Initialize database
py -c "from database import init_db; init_db()"
```

### Step 3: Frontend Setup

#### Registration Form

```bash
cd frontend/registration-form

# Install dependencies
npm install

# Dependencies are already configured:
# - axios (API calls)
# - react-router-dom (routing)
# - tailwindcss (styling)
```

#### Admin Dashboard

```bash
cd frontend/admin-dashboard

# Install dependencies
npm install

# Dependencies are already configured:
# - axios (API calls)
# - react-router-dom (routing)
# - tailwindcss (styling)
```

### Step 4: Flutter App Setup (Optional)

```bash
cd ticket_scanner

# Create Flutter project
flutter create .

# Install dependencies
flutter pub get
```

---

## 🚀 **Running the Application**

You'll need **3 separate terminal windows** (or use the provided PowerShell scripts):

### Terminal 1 - Backend API

```powershell
cd backend
py main.py
```

**Or use the quick-start script:**
```powershell
.\start-backend.ps1
```

✅ Backend runs at: **http://localhost:8000**
📚 API Docs: **http://localhost:8000/docs**

### Terminal 2 - Registration Form

```powershell
cd frontend/registration-form
npm run dev
```

**Or use the quick-start script:**
```powershell
.\start-registration.ps1
```

✅ Form runs at: **http://localhost:5000**

### Terminal 3 - Admin Dashboard

```powershell
cd frontend/admin-dashboard
npm run dev
```

**Or use the quick-start script:**
```powershell
.\start-admin.ps1
```

✅ Dashboard runs at: **http://localhost:5001**

### Mobile App (Optional)

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

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Database
DATABASE_URL=sqlite:///./event_tickets.db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@yourevent.com
FROM_NAME=Event Ticket System

# Security
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256

# Frontend URLs (for CORS)
FRONTEND_REGISTRATION_URL=http://localhost:5173
FRONTEND_ADMIN_URL=http://localhost:5174
```

**Note**: For Gmail SMTP, you need to generate an [App Password](https://support.google.com/accounts/answer/185833) instead of using your regular password.

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

## 🚦 **Current Status**

✅ **Phase 1**: Basic form submission (Backend + Database setup complete)
🔄 **Next**: Build registration form UI with React + Tailwind

---

**Ready to start? Run the applications and visit:**
- 🌐 Registration Form: http://localhost:5000
- 🔧 Admin Dashboard: http://localhost:5001
- 📡 API Backend: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs
- 📱 Flutter App: Android/iOS only (web & desktop removed)
