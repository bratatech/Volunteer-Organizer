require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('../backend/routes/auth');
const activityRoutes = require('../backend/routes/activities');
const aiRoutes = require('../backend/routes/ai');
const taskRoutes = require('../backend/routes/tasks');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Export the Express app for Vercel serverless
module.exports = app;
