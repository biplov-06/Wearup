// API configuration for WearUp
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:8000/api'
  : 'https://wearup-django.onrender.com/api';

const MEDIA_BASE = import.meta.env.DEV
  ? 'http://localhost:8000'
  : 'https://wearup-django.onrender.com';

export { API_BASE, MEDIA_BASE };
