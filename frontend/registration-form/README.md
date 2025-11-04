# Registration Form - Event Ticketing System# React + Vite



React-based registration form for event ticket bookings.This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



## 🚀 FeaturesCurrently, two official plugins are available:



- **User Registration**: Name, email, and phone input- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh

- **Form Validation**: Client-side validation- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

- **API Integration**: Submits to FastAPI backend

- **Responsive Design**: Works on mobile and desktop## React Compiler

- **Email Delivery**: Automatic QR ticket via email

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## 📋 Tech Stack

## Expanding the ESLint configuration

- **Framework**: React 18 + Vite

- **Styling**: Plain CSSIf you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

- **HTTP**: Fetch API

## 🛠️ Installation

### Prerequisites
- Node.js 16+
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
cd frontend/registration-form
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

Access at: `http://localhost:5173`

## 📝 Form Fields

- **Name**: Full name (required)
- **Email**: Valid email address (required)
- **Phone**: Phone number (required)

## 🔌 API Integration

### Registration Endpoint
```
POST /api/register
```

**Request**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

**Response**:
```json
{
  "message": "Registration successful! Check your email for the ticket.",
  "serial_number": "TKT-1234567890"
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
- [Admin Dashboard](../admin-dashboard/)
- [Flutter Scanner App](../../ticket_scanner/)
