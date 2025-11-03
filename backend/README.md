# Event Ticket System - Backend (Phase 1)

FastAPI backend for event registration and ticket management.

## 🎯 Phase 1 Features

✅ User registration form submission  
✅ MySQL/MariaDB database integration  
✅ Admin dashboard data retrieval  
✅ Input validation with Pydantic  
✅ RESTful API endpoints  

## 📋 Prerequisites

- Python 3.8+
- MySQL/MariaDB server running
- OR SQLite for quick testing

## 🚀 Setup

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Database

Edit `.env` file:

```env
# For MySQL (recommended)
DATABASE_URL=mysql+pymysql://username:password@localhost:3306/event_tickets

# OR for SQLite (testing only)
DATABASE_URL=sqlite:///./event_tickets.db
```

### 4. Create MySQL Database (if using MySQL)

```sql
CREATE DATABASE event_tickets CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Initialize Database Tables

```bash
python setup_db.py
```

### 6. Run the Server

```bash
# Development mode (auto-reload)
uvicorn main:app --reload

# Or using Python directly
python main.py
```

Server will start at: **http://localhost:8000**

## �️ Database Schema (Phase 1)

### `registrations` Table

| Column     | Type         | Description                      |
| ---------- | ------------ | -------------------------------- |
| id         | INT (PK)     | Auto-increment primary key       |
| name       | VARCHAR(255) | Participant full name            |
| email      | VARCHAR(255) | Email address (unique)           |
| phone      | VARCHAR(20)  | Contact number                   |
| team_name  | VARCHAR(255) | Team name (optional)             |
| members    | TEXT         | Comma-separated member names     |
| status     | VARCHAR(20)  | pending/approved/rejected        |
| created_at | DATETIME     | Registration timestamp           |
| updated_at | DATETIME     | Last update timestamp            |

## 🔧 Troubleshooting

### MySQL Connection Error

If you get a connection error:

1. Make sure MySQL is running
2. Check credentials in `.env`
3. Verify database exists: `CREATE DATABASE event_tickets;`
4. Test connection: `mysql -u root -p`

### SQLite for Quick Testing

If you don't have MySQL set up yet:

```env
# In .env file
DATABASE_URL=sqlite:///./event_tickets.db
```

## 📦 Project Structure

```
backend/
├── main.py                 # FastAPI app entry point
├── config.py              # Configuration settings
├── database.py            # Database connection
├── setup_db.py            # Database initialization script
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── models/
│   └── registration.py    # Registration data model
├── routes/
│   ├── registration.py    # Public registration endpoints
│   └── admin.py          # Admin endpoints
└── utils/                # Utilities (Phase 2)
```

## 🔜 Coming in Phase 2

- 📸 Payment screenshot upload
- 📨 Email notifications with tickets
- 🎟️ QR code generation
- 🔐 Admin authentication (JWT)
- ✅ Approve/Reject functionality

## 🧪 Testing the API

### Test Registration

```python
import requests

response = requests.post("http://localhost:8000/api/register", json={
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1987654321",
    "team_name": "Code Warriors",
    "members": "Mike, Sarah, Tom"
})

print(response.json())
```

### Test Admin Dashboard

```python
import requests

# Get all registrations
response = requests.get("http://localhost:8000/api/admin/registrations")
print(response.json())

# Get statistics
response = requests.get("http://localhost:8000/api/admin/stats")
print(response.json())
```

---

**Phase 1 Complete** ✅ | Ready for Frontend Integration


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
