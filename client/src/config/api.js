// API base URL - uses environment variable in production, localhost in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export default API_BASE_URL;
