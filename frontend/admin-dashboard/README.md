# Admin Dashboard - Event Ticketing System

React-based admin dashboard for viewing and managing event registrations.

## 🚀 Features

- **View Registrations**: List all registered users
- **Real-time Data**: Fetch latest registrations from API
- **Ticket Status**: See if tickets are used/unused
- **Responsive Table**: Mobile-friendly data display
- **Search & Filter**: Find specific registrations

## 📋 Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **HTTP**: Fetch API

## 🛠️ Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
cd frontend/admin-dashboard
npm install
```

2. **Configure API endpoint**:
Edit `src/App.jsx`:
```javascript
// For local development
const API_URL = 'http://localhost:8000';

// For production
const API_URL = 'https://event-ticketing-system-devx.onrender.com';
```

3. **Run development server**:
```bash
npm run dev
```

Access at: `http://localhost:5174`

## 📊 Dashboard Features

### Registration Table
- **ID**: Registration ID
- **Name**: User's full name
- **Email**: Contact email
- **Phone**: Phone number
- **Serial Number**: Unique ticket ID
- **Status**: Used / Not Used
- **Registration Date**: Timestamp

## 🔌 API Integration

### Get All Registrations
```
GET /api/admin/registrations
```

**Response**:
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "serial_number": "TKT-1234567890",
    "is_used": false,
    "registration_date": "2025-11-04T10:30:00"
  }
]
```

## 🎨 Tailwind CSS v4

Using Tailwind CSS v4 with PostCSS plugin:
```javascript
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

## 🚢 Building for Production

```bash
npm run build
```

Output: `dist/` folder

## 📄 License

See main repository LICENSE file.

## 🔗 Related

- [Backend API](../../backend/)
- [Registration Form](../registration-form/)
- [Flutter Scanner App](../../ticket_scanner/)
