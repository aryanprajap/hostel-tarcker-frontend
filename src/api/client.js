import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request automatically if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ht_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const registerUser = (userData) => API.post('/auth/register', userData);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.patch('/auth/profile', data);

// Complaints
export const getComplaints = (params) => API.get('/complaints', { params });
export const getComplaint = (id) => API.get(`/complaints/${id}`);
export const createComplaint = (data) => API.post('/complaints', data);
export const updateComplaint = (id, data) => API.patch(`/complaints/${id}`, data);
export const deleteComplaint = (id) => API.delete(`/complaints/${id}`);
export const addComment = (id, data) => API.post(`/complaints/${id}/comment`, data);

// Analytics
export const getAnalyticsSummary = () => API.get('/analytics/summary');
export const getAnalyticsTrends = (days = 30) => API.get('/analytics/trends', { params: { days } });
export const getResolutionTime = () => API.get('/analytics/resolution-time');
export const getStaffPerformance = () => API.get('/analytics/staff-performance');

// Staff
export const getStaff = () => API.get('/staff');
export const createStaff = (data) => API.post('/staff', data);
export const updateStaff = (id, data) => API.patch(`/staff/${id}`, data);
export const deleteStaff = (id) => API.delete(`/staff/${id}`);

// Announcements
export const getAnnouncements = () => API.get('/announcements');
export const createAnnouncement = (data) => API.post('/announcements', data);
export const updateAnnouncement = (id, data) => API.patch(`/announcements/${id}`, data);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// History
export const getGlobalHistory = (params) => API.get('/history', { params });

export default API;
