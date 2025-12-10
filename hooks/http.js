import axios from 'axios';

// You can set EXPO_PUBLIC_API_URL in your environment for different backends
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://your-api-base-url.example.com/';

const api = axios.create({
  baseURL,
  timeout: 15000,
});

export default api;

