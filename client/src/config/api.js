// API base URL - uses environment variable in production, Fly.io in development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pokemon-ev-trainer-api.fly.dev';

export default API_BASE_URL;
