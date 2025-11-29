// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const API_ENDPOINTS = {
  REGISTER: `${API_BASE_URL}/api/register`,
  UPLOAD_PAYMENT: `${API_BASE_URL}/api/upload-payment`,
  UPLOAD_PHOTO: `${API_BASE_URL}/api/upload-photo`,
  TEST_UPLOAD: `${API_BASE_URL}/api/test/upload`,
};

export default API_BASE_URL;
