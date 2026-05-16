require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check - simple test endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Import routes with error handling
try {
  const authRoutes = require('../backend/routes/auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.error('Error loading auth routes:', error.message);
}

try {
  const activityRoutes = require('../backend/routes/activities');
  app.use('/api/activities', activityRoutes);
} catch (error) {
  console.error('Error loading activity routes:', error.message);
}

try {
  const taskRoutes = require('../backend/routes/tasks');
  app.use('/api/tasks', taskRoutes);
} catch (error) {
  console.error('Error loading task routes:', error.message);
}

try {
  const aiRoutes = require('../backend/routes/ai');
  app.use('/api/ai', aiRoutes);
} catch (error) {
  console.error('Error loading AI routes:', error.message);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Export the Express app for Vercel serverless
module.exports = app;
