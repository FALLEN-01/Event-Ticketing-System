# Registration Form - Event Ticketing System

Public-facing registration form for event ticket bookings with payment screenshot upload.

## Features

- **Multi-step Form** - 3-step registration process
  - Step 1: Personal details + payment type
  - Step 2: Payment screenshot upload
  - Step 3: Review and submit
- **Registration Types:**
  - **Individual** - Single participant
  - **Bulk** - Team of exactly 4 members
- **File Upload** - Payment screenshot with validation
- **Form Validation** - Client-side validation before submission
- **Responsive Design** - Mobile-friendly UI
- **Custom CSS Styling** - Light purple/lavender theme
- **Success/Error Messages** - User feedback
- **Email Confirmation** - Automatic confirmation email

## Tech Stack

- **React** 19.1.1 - UI library
- **Vite** 7.1.7 - Build tool
- **Axios** 1.13.1 - HTTP client
- **Plain CSS** - Custom styling (no Tailwind)

## Project Structure

```
registration-form/
├── src/
│   ├── App.jsx              # Multi-step form component
│   ├── App.css              # Custom CSS styles
│   ├── index.css            # Global styles
│   ├── config.js            # API endpoints configuration
│   └── assets/              # Static assets
├── .env                     # Environment config (create from .env.example)
├── package.json
├── vite.config.js
├── Dockerfile
└── nginx.conf               # Production nginx config
```

## Setup

1. **Install dependencies:**
```bash
cd frontend/registration-form
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

Configure `.env`:
```env
# Backend API URL (without /api suffix)
VITE_API_URL=http://localhost:8000

# For production:
# VITE_API_URL=https://your-backend.onrender.com
```

3. **Run development server:**
```bash
npm run dev
```

Access at: http://localhost:5000

## Form Fields

### Step 1: Personal Details

**Individual Registration:**
- Participant Name (required)
- Email Address (required)
- Phone Number (required)
- Registration Type: Individual

**Bulk Registration (Team):**
- Participant Name (required) - Team leader
- Email Address (required)
- Phone Number (required)
- Registration Type: Bulk
- Team Name (required)
- Team Members (required) - Exactly 4 comma-separated names

### Step 2: Payment Upload

- Payment Screenshot (required)
- Supported formats: JPG, PNG, WebP
- Maximum size: 2MB
- Validation: File type and size checked client-side

### Step 3: Review

- Review all entered information
- Confirm before submission
- Submit registration

## Registration Flow

1. User fills Step 1 (personal details)
2. Client-side validation
3. Navigate to Step 2 (payment upload)
4. Upload payment screenshot
5. Navigate to Step 3 (review)
6. Submit registration
7. Backend processes:
   - Creates `Registration` record
   - Uploads screenshot to Supabase Storage
   - Creates `Payment` record (status: pending)
   - Creates `Ticket` records (1 for individual, 4 for bulk)
   - Sends confirmation email
8. User sees success message
9. Option to register another person

## API Integration

### Registration Endpoint

**POST** `/api/register`

**Content-Type:** `multipart/form-data`

**Fields:**
```javascript
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  payment_type: "individual",  // or "bulk"
  payment_screenshot: File,
  // For bulk only:
  team_name: "Tech Warriors",
  members: "Alice, Bob, Charlie, David"  // Exactly 4 members
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "status": "pending",
  "message": "Registration submitted successfully! You will receive a confirmation email shortly."
}
```

## Form Validation

### Client-Side Validation

**Step 1:**
- All required fields filled
- Valid email format
- For bulk: Team name and exactly 4 members

**Step 2:**
- File selected
- File type: JPG, PNG, or WebP
- File size: < 2MB

### Error Messages

- Red alert box with error icon
- Specific error message
- Form stays on current step until fixed

### Success Messages

- Green alert box with checkmark
- Confirmation message
- "Register Another Person" button appears

## Custom Styling

Uses custom CSS with light purple/lavender theme:

### Key Styles

**Form Container:**
```css
.form-container {
  background: white;
  border-radius: 16px;
  padding: 2.5rem 3.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
}
```

**Inputs:**
```css
.lavender-input {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.lavender-input:focus {
  background: white;
  border-color: #c4b5fd;
  box-shadow: 0 0 0 3px rgba(196, 181, 253, 0.15);
}
```

**Buttons:**
```css
.lavender-button {
  background: #c4b5fd;
  color: #4c1d95;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(196, 181, 253, 0.3);
}
```

**Step Indicator:**
- Active steps: Purple background (#c4b5fd)
- Inactive steps: Gray background
- Connecting lines between steps

**Background:**
- Nature image background (Unsplash)
- Lavender overlay: `rgba(230, 224, 255, 0.4)`
- Decorative blur circles

## Building for Production

```bash
npm run build
```

Output: `dist/` folder

### Docker Build

```bash
docker build -t registration-form .
docker run -p 5000:80 registration-form
```

Or use docker-compose from project root.

## Environment Variables

### Development
```env
VITE_API_URL=http://localhost:8000
```

### Production
```env
VITE_API_URL=https://event-ticketing-system-devx.onrender.com
```

## Troubleshooting

### Form Not Submitting
- Check browser console for errors
- Verify `VITE_API_URL` in `.env`
- Ensure backend is running
- Check network tab for request details

### File Upload Fails
- Verify file is < 2MB
- Check file format (JPG, PNG, WebP only)
- Ensure Supabase Storage is configured
- Check backend logs for errors

### Email Not Received
- Check spam folder
- Verify SMTP configuration in backend
- Check backend logs for email errors
- Confirm email address is correct

### CORS Errors
- Add frontend URL to backend `CORS_ORIGINS`
- Check backend console for CORS logs
- Verify `VITE_API_URL` format

## Testing

### Test Individual Registration
1. Fill form with valid data
2. Select "Individual" registration type
3. Upload payment screenshot
4. Review and submit
5. Check success message
6. Verify email received

### Test Bulk Registration
1. Fill form with valid data
2. Select "Bulk" registration type
3. Enter team name
4. Enter exactly 4 member names (comma-separated)
5. Upload payment screenshot
6. Review and submit
7. Check success message
8. Verify email received

## License

See main repository LICENSE file.

## Related Documentation

- [Backend API](../../backend/README.md)
- [Admin Dashboard](../admin-dashboard/README.md)
- [Main README](../../README.md)

---

**Status:** ✅ Production Ready | v1.0.0
