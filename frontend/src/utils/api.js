import axios from 'axios';

// Use environment variable or default to relative path for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests safely
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to catch 401 and redirect to landing page
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session invalid or expired - clearing storage and redirecting...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

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
export const getActivityVolunteers = (id) => api.get(`/activities/${id}/volunteers`);
export const setActivityLeader = (id, email) => api.patch(`/activities/${id}/leader`, { email });

// AI APIs
export const getAISuggestion = (data) => api.post('/ai/suggest-area', data);

// Task APIs
export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const assignTask = (id, email) => api.patch(`/tasks/${id}/assign`, { email });
export const unassignTask = (id) => api.patch(`/tasks/${id}/unassign`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const getMyTasks = () => api.get('/tasks/my-tasks');
export const toggleTaskStatus = (id) => api.patch(`/tasks/${id}/status`);

// Chat APIs
export const getChatHistory = (activityId) => api.get(`/chat/${activityId}`);

// Profile Update API
export const updateVolunteerProfile = (data) => api.put('/auth/volunteer/profile', data);
export const getVolunteerProfile = () => api.get('/auth/volunteer/profile');

// Application Approval API
export const updateApplicationStatus = (activityId, volunteerId, status) => 
  api.patch(`/activities/${activityId}/applications/${volunteerId}`, { status });

// Explore and Discovery APIs
export const getAvailableOpportunities = () => api.get('/activities/explore');
export const applyForActivity = (id) => api.post(`/activities/${id}/join`);
export const claimTask = (id) => api.post(`/tasks/${id}/claim`);

// Delete Activity API
export const deleteActivity = (id) => api.delete(`/activities/${id}`);

// Conclude & Certify API
export const concludeActivityAndIssueCertificates = (id, certifiedVolunteerIds) => 
  api.post(`/activities/${id}/conclude`, { certifiedVolunteerIds });

// Workflow loop APIs
export const applyForOpportunity = (activityId, taskId = null) => 
  api.post(`/activities/${activityId}/apply`, { taskId });

export const handleApplicationDecision = (activityId, volunteerId, action) => 
  api.patch(`/activities/${activityId}/applications/${volunteerId}`, { action });

// Organizer Analytics API
export const getVolunteerOverview = () => api.get('/organizers/volunteer-overview');

export default api;
