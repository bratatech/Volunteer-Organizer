require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log('✓ Auth routes loaded');
} catch (error) {
  console.error('✗ Error loading auth routes:', error.message);
  // Don't exit, allow server to start with partial functionality
}

try {
  const activityRoutes = require('../backend/routes/activities');
  app.use('/api/activities', activityRoutes);
  console.log('✓ Activity routes loaded');
} catch (error) {
  console.error('✗ Error loading activity routes:', error.message);
}

try {
  const taskRoutes = require('../backend/routes/tasks');
  app.use('/api/tasks', taskRoutes);
  console.log('✓ Task routes loaded');
} catch (error) {
  console.error('✗ Error loading task routes:', error.message);
}

try {
  const aiRoutes = require('../backend/routes/ai');
  app.use('/api/ai', aiRoutes);
  console.log('✓ AI routes loaded');
} catch (error) {
  console.error('✗ Error loading AI routes:', error.message);
}

// Serve static files from frontend dist (for production)
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// 404 handler for non-API routes - serve index.html for frontend routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(frontendPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ message: 'Not found' });
      }
    });
  } else {
    res.status(404).json({ message: 'API route not found', path: req.path });
  }
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
