import axios from 'axios';

// Base API instance
export const api = axios.create({
  baseURL: 'http://localhost:5033', // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For refresh token cookies
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiry (401)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Basic 401 handler (in a real app, you would attempt refresh here)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('accessToken');
      window.location.href = '/'; // redirect to login
    }
    return Promise.reject(error);
  }
);
