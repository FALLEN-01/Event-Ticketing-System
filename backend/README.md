# Event Ticket System - Backend

FastAPI backend for event registration and ticket management.

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   copy .env.example .env
   # Edit .env with your configuration
   ```

4. **Initialize database:**
   ```bash
   python -c "from database import init_db; init_db()"
   ```

5. **Run the server:**
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### Public Registration
- `POST /api/registration/submit` - Submit new registration
- `GET /api/registration/check/{email}` - Check registration status

### Admin (TODO: Add authentication)
- `GET /api/admin/registrations` - Get all registrations
- `PATCH /api/admin/registrations/{id}/approve` - Approve registration
- `PATCH /api/admin/registrations/{id}/reject` - Reject registration

## API Documentation

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
