import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const volunteerSignup = (data) => api.post('/auth/volunteer/signup', data);
export const volunteerLogin = (data) => api.post('/auth/volunteer/login', data);
export const organizerSignup = (data) => api.post('/auth/organizer/signup', data);
export const organizerLogin = (data) => api.post('/auth/organizer/login', data);

// Activity APIs
export const getAllActivities = () => api.get('/activities');
export const getMyActivities = () => api.get('/activities/my-activities');
export const createActivity = (data) => api.post('/activities', data);
export const joinActivity = (id) => api.post(`/activities/${id}/join`);

// AI APIs
export const getAISuggestion = (data) => api.post('/ai/suggest-area', data);

// Task APIs
export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const assignTask = (id, email) => api.patch(`/tasks/${id}/assign`, { email });
export const unassignTask = (id) => api.patch(`/tasks/${id}/unassign`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getMyTasks = () => api.get('/tasks/my-tasks');

export default api;
