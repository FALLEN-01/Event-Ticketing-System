// API Configuration
// Automatically detects if running locally or on Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:8000' 
    : 'https://event-ticketing-system-devx.onrender.com');

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  UPLOAD_PAYMENT: `${API_BASE_URL}/api/upload-payment`,
  UPLOAD_PHOTO: `${API_BASE_URL}/api/upload-photo`,
  TEST_UPLOAD: `${API_BASE_URL}/api/test/upload`,
};

export default API_BASE_URL;
