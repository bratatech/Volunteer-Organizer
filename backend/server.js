require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const aiRoutes = require('./routes/ai');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.FRONTEND_URL || '*';

// Middleware
app.use(cors({ origin: allowedOrigin }));
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

// Only start server if not in Vercel serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
