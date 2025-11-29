# Admin Dashboard - Event Ticketing System

React admin dashboard with glassmorphic UI for managing event registrations.

## Features

- **JWT Authentication** - Secure login with HTTP-only cookies
- **10 Dashboard Sections** - Complete admin interface
  - Dashboard Overview (stats & recent registrations)
  - Events Management
  - Tickets Management
  - Participants Management
  - Attendance Tracking
  - **Approvals** (two-pane interface for payment verification)
  - Payments Verification
  - Admins & Roles
  - Settings
  - Audit Log
- **Real-time Data** - Live updates from backend API
- **Glassmorphic Design** - BTF-inspired UI with backdrop blur
- **Protected Routes** - Auth-required pages
- **Logout Functionality** - Clear session and redirect

## Tech Stack

- **React** 19.1.1 - UI library
- **Vite** 7.1.12 - Build tool
- **Tailwind CSS** 3.4.17 - Utility-first styling
- **Axios** 1.13.1 - HTTP client with interceptors
- **React Router DOM** 7.9.5 - Client-side routing
- **Lucide React** 0.555.0 - Icon library

## Project Structure

```
admin-dashboard/
├── src/
│   ├── App.jsx              # Router configuration
│   ├── config.js            # Axios instance with auth interceptors
│   ├── index.css            # Tailwind directives
│   ├── pages/
│   │   ├── Auth.jsx         # Login page
│   │   └── Dashboard.jsx    # Main dashboard with sidebar
│   └── components/
│       ├── DashboardOverview.jsx      # Home page with stats
│       ├── EventsManagement.jsx
│       ├── TicketsManagement.jsx
│       ├── ParticipantsManagement.jsx
│       ├── AttendanceTracking.jsx
│       ├── Approvals.jsx              # Payment approval interface
│       ├── PaymentsVerification.jsx
│       ├── AdminsRoles.jsx
│       ├── SettingsPage.jsx
│       ├── AuditLog.jsx
│       └── ProtectedRoute.jsx         # Auth guard component
├── .env                     # Environment config (create from .env.example)
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.cjs       # PostCSS for Tailwind v3
├── Dockerfile
└── nginx.conf               # Production nginx config
```

## Setup

1. **Install dependencies:**
```bash
cd frontend/admin-dashboard
npm install
```

2. **Create `.env` file:**
```bash
cp .env.example .env  # Linux/Mac
copy .env.example .env  # Windows
```

Configure `.env`:
```env
# Backend API URL (with /api suffix)
VITE_API_URL=http://localhost:8000/api

# For production:
# VITE_API_URL=https://your-backend.onrender.com/api
```

3. **Run development server:**
```bash
npm run dev
```

Access at: http://localhost:5173

## Default Login Credentials

- **Email:** `admin@gmail.com`
- **Password:** `admin123`

⚠️ Change password after first login!

## Key Features

### Authentication Flow
1. Login page validates email/password
2. Backend returns JWT token
3. Token stored in:
   - `localStorage` (backup)
   - HTTP-only cookie (primary, secure)
4. Axios interceptor adds token to all requests
5. Auto-redirect to `/auth` on 401 errors

### Approvals Component
- **Two-pane layout:**
  - Left: Filterable list of registrations (pending/approved/rejected)
  - Right: Selected registration details with payment screenshot
- **Actions:**
  - Approve registration (generates tickets + sends email)
  - Reject with reason (sends rejection email)

### Dashboard Overview
- Real-time statistics cards
- Recent registrations table
- Quick stats: Total, Pending, Approved, Rejected

## API Integration

All API calls use `axiosInstance` from `src/config.js`:

```javascript
import axiosInstance from '../config'

// Example: Fetch registrations
const response = await axiosInstance.get('/admin/registrations')

// Example: Approve registration
await axiosInstance.post(`/admin/registrations/${id}/approve`)
```

### Axios Interceptors

**Request Interceptor:**
- Adds `Authorization: Bearer {token}` header
- Sends credentials (cookies) with every request

**Response Interceptor:**
- Handles 401 errors automatically
- Clears localStorage and redirects to `/auth`

## Building for Production

```bash
npm run build
```

Output: `dist/` folder

### Docker Build

```bash
docker build -t admin-dashboard .
docker run -p 5001:80 admin-dashboard
```

Or use docker-compose from project root.

## Environment Variables

### Development
```env
VITE_API_URL=http://localhost:8000/api
```

### Production
```env
VITE_API_URL=https://event-ticketing-system-devx.onrender.com/api
```

## Styling

Uses **Tailwind CSS v3** with custom glassmorphic theme:

- **Background:** Purple/pink gradient with backdrop blur
- **Cards:** `bg-white/10 backdrop-blur-md`
- **Borders:** `border-white/20`
- **Shadows:** Subtle drop shadows
- **Hover Effects:** Transform and shadow transitions

### PostCSS Configuration

`postcss.config.cjs`:
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
}
```

## Troubleshooting

### White Screen After Login
- Check browser console for errors
- Verify `VITE_API_URL` is correct
- Ensure backend is running
- Clear localStorage and try again

### 401 Unauthorized Errors
- Check JWT token in localStorage
- Verify cookie is set (DevTools → Application → Cookies)
- Re-login to get fresh token

### CORS Errors
- Add frontend URL to backend `CORS_ORIGINS`
- Check backend console for CORS logs
- Ensure `withCredentials: true` in axios config

### Tailwind Styles Not Working
- Restart dev server after config changes
- Verify `postcss.config.cjs` exists
- Check `index.css` has Tailwind directives

## License

See main repository LICENSE file.

## Related Documentation

- [Backend API](../../backend/README.md)
- [Registration Form](../registration-form/README.md)
- [Main README](../../README.md)

---

**Status:** ✅ Production Ready | v1.0.0
