# Backend API - Event Ticketing System# Event Ticket System - Backend (Phase 1)



FastAPI backend for event registration and ticket management system.FastAPI backend for event registration and ticket management.



## 🚀 Features## 🎯 Phase 1 Features



- **Registration API**: User registration with email validation✅ User registration form submission  

- **Admin Dashboard API**: View all registrations✅ MySQL/MariaDB database integration  

- **Ticket Verification**: QR code scanning and validation✅ Admin dashboard data retrieval  

- **Email Integration**: Automated ticket delivery via email✅ Input validation with Pydantic  

- **Database**: Supabase PostgreSQL with Session Pooler (IPv4 compatible)✅ RESTful API endpoints  



## 📋 Tech Stack## 📋 Prerequisites



- **Framework**: FastAPI 0.121.0- Python 3.8+

- **Database**: Supabase PostgreSQL- MySQL/MariaDB server running

- **ORM**: SQLAlchemy 2.0.44- OR SQLite for quick testing

- **Server**: Uvicorn (ASGI)

- **Email**: aiosmtplib for async email sending## 🚀 Setup

- **QR Codes**: qrcode library with Pillow

### 1. Create Virtual Environment

## 🛠️ Installation

```bash

### Prerequisites# Windows

- Python 3.13+python -m venv venv

- Supabase accountvenv\Scripts\activate



### Setup# Linux/Mac

python -m venv venv

1. **Install dependencies**:source venv/bin/activate

```bash```

cd backend

pip install -r requirements.txt### 2. Install Dependencies

```

```bash

2. **Configure environment variables**:pip install -r requirements.txt

Create a `.env` file:```

```env

# Database Configuration (Supabase Session Pooler)### 3. Configure Database

user=postgres.YOUR_PROJECT_REF

password=YOUR_PASSWORDEdit `.env` file:

host=aws-1-ap-southeast-1.pooler.supabase.com

port=5432```env

dbname=postgres# For MySQL (recommended)

DATABASE_URL=postgresql+psycopg2://postgres.YOUR_PROJECT_REF:YOUR_PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgresDATABASE_URL=mysql+pymysql://username:password@localhost:3306/event_tickets



# Supabase API# OR for SQLite (testing only)

SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.coDATABASE_URL=sqlite:///./event_tickets.db

SUPABASE_KEY=YOUR_ANON_KEY```



# CORS Origins### 4. Create MySQL Database (if using MySQL)

CORS_ORIGINS=["http://localhost:5000","http://localhost:5001"]

``````sql

CREATE DATABASE event_tickets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. **Run the server**:```

```bash

uvicorn main:app --host 0.0.0.0 --port 8000 --reload### 5. Initialize Database Tables

```

```bash

## 📡 API Endpointspython setup_db.py

```

### Health & Status

- `GET /` - API info and version### 6. Run the Server

- `GET /health` - Health check

- `GET /ping` - Keep-alive endpoint (for Render)```bash

# Development mode (auto-reload)

### Registrationuvicorn main:app --reload

- `POST /api/register` - Register new user

  ```json# Or using Python directly

  {python main.py

    "name": "John Doe",```

    "email": "john@example.com",

    "phone": "1234567890"Server will start at: **http://localhost:8000**

  }

  ```## �️ Database Schema (Phase 1)



### Admin### `registrations` Table

- `GET /api/admin/registrations` - Get all registrations

| Column     | Type         | Description                      |

### Ticket Verification| ---------- | ------------ | -------------------------------- |

- `GET /verify-ticket/{serial_number}` - Verify ticket validity| id         | INT (PK)     | Auto-increment primary key       |

- `POST /mark-used/{serial_number}` - Mark ticket as used| name       | VARCHAR(255) | Participant full name            |

| email      | VARCHAR(255) | Email address (unique)           |

## 🗄️ Database Schema| phone      | VARCHAR(20)  | Contact number                   |

| team_name  | VARCHAR(255) | Team name (optional)             |

### Registration Table| members    | TEXT         | Comma-separated member names     |

```sql| status     | VARCHAR(20)  | pending/approved/rejected        |

CREATE TABLE registration (| created_at | DATETIME     | Registration timestamp           |

    id SERIAL PRIMARY KEY,| updated_at | DATETIME     | Last update timestamp            |

    name VARCHAR(100) NOT NULL,

    email VARCHAR(100) UNIQUE NOT NULL,## 🔧 Troubleshooting

    phone VARCHAR(15) NOT NULL,

    serial_number VARCHAR(50) UNIQUE NOT NULL,### MySQL Connection Error

    qr_code_path VARCHAR(255),

    is_used BOOLEAN DEFAULT FALSE,If you get a connection error:

    registration_date TIMESTAMP DEFAULT NOW()

);1. Make sure MySQL is running

```2. Check credentials in `.env`

3. Verify database exists: `CREATE DATABASE event_tickets;`

## 🚢 Deployment4. Test connection: `mysql -u root -p`



### Render Deployment### SQLite for Quick Testing



1. **Connect GitHub repo** to RenderIf you don't have MySQL set up yet:

2. **Set Build Command**: 

   ```bash```env

   cd backend && pip install -r requirements.txt# In .env file

   ```DATABASE_URL=sqlite:///./event_tickets.db

3. **Set Start Command**: ```

   ```bash

   cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT## 📦 Project Structure

   ```

4. **Add Environment Variables**:```

   - `DATABASE_URL`: Supabase Session Pooler connection stringbackend/

   - `SUPABASE_URL`: Your Supabase URL├── main.py                 # FastAPI app entry point

   - `SUPABASE_KEY`: Your Supabase anon key├── config.py              # Configuration settings

├── database.py            # Database connection

### Important: Supabase Connection├── setup_db.py            # Database initialization script

├── requirements.txt       # Python dependencies

**Use Session Pooler** (not direct connection) for IPv4 compatibility:├── .env                   # Environment variables

```├── models/

postgresql+psycopg2://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres?sslmode=require│   └── registration.py    # Registration data model

```├── routes/

│   ├── registration.py    # Public registration endpoints

Render requires Session Pooler because it's IPv4-only. Direct connection uses IPv6.│   └── admin.py          # Admin endpoints

└── utils/                # Utilities (Phase 2)

## 🔒 SSL Configuration```



SSL certificate is stored in `backend/certs/CAPEM.crt` and automatically used when available.## 🔜 Coming in Phase 2



## 📝 Project Structure- 📸 Payment screenshot upload

- 📨 Email notifications with tickets

```- 🎟️ QR code generation

backend/- 🔐 Admin authentication (JWT)

├── main.py              # FastAPI app entry point- ✅ Approve/Reject functionality

├── database.py          # Database configuration

├── requirements.txt     # Python dependencies## 🧪 Testing the API

├── .env                 # Environment variables (local)

├── models/### Test Registration

│   └── registration.py  # SQLAlchemy models

├── routes/```python

│   ├── registration.py  # Registration endpointsimport requests

│   ├── admin.py         # Admin endpoints

│   └── ticket.py        # Ticket verification endpointsresponse = requests.post("http://localhost:8000/api/register", json={

├── utils/    "name": "Jane Smith",

│   ├── email.py         # Email sending utilities    "email": "jane@example.com",

│   └── qr_generator.py  # QR code generation    "phone": "+1987654321",

├── static/    "team_name": "Code Warriors",

│   └── uploads/         # QR code storage    "members": "Mike, Sarah, Tom"

└── certs/})

    └── CAPEM.crt        # SSL certificate

```print(response.json())

```

## 🐛 Troubleshooting

### Test Admin Dashboard

### Database Connection Issues

- **IPv6 Error**: Make sure you're using Session Pooler, not direct connection```python

- **Tenant not found**: Verify the correct region (aws-1-ap-southeast-1)import requests

- **Password auth failed**: Check your Supabase password

# Get all registrations

### Local Developmentresponse = requests.get("http://localhost:8000/api/admin/registrations")

- Use the Session Pooler connection string (works for both local and production)print(response.json())

- Ensure SSL certificate is in `backend/certs/CAPEM.crt`

# Get statistics

## 📄 Licenseresponse = requests.get("http://localhost:8000/api/admin/stats")

print(response.json())

See main repository LICENSE file.```



## 🔗 Related---



- [Frontend Registration Form](../frontend/registration-form/)**Phase 1 Complete** ✅ | Ready for Frontend Integration

- [Admin Dashboard](../frontend/admin-dashboard/)

- [Flutter Scanner App](../ticket_scanner/)

Once the server is running, visit:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🛣️ API Endpoints

### Public Registration

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| POST   | `/api/register`              | Submit new registration  |
| GET    | `/api/registration/status/{email}` | Check status by email    |

### Admin Dashboard

| Method | Endpoint                     | Description              |
| ------ | ---------------------------- | ------------------------ |
| GET    | `/api/admin/registrations`   | Get all registrations    |
| GET    | `/api/admin/registrations/{id}` | Get specific registration |
| GET    | `/api/admin/stats`           | Get dashboard statistics |

### Example: Register a User

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "team_name": "Tech Wizards",
    "members": "Alice, Bob, Charlie"
  }'
```

### Example: Get All Registrations

```bash
curl http://localhost:8000/api/admin/registrations
```

## 🗄️ Database Schema (Phase 1)

### `registrations` Table

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

Currently using SQLite for development. For production, switch to PostgreSQL by updating `DATABASE_URL` in `.env`.

## TODO

- [ ] Add authentication for admin routes
- [ ] Implement email sending
- [ ] Add file upload for payment screenshots
- [ ] Complete QR code generation workflow
- [ ] Add rate limiting
- [ ] Add input validation and sanitization
- [ ] Add logging
