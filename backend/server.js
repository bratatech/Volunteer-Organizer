const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { readData, writeData, verifyAndInitializeDatabases } = require('./utils/fileHandler');

const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const aiRoutes = require('./routes/ai');
const taskRoutes = require('./routes/tasks');
const chatRoutes = require('./routes/chat');
const organizerRoutes = require('./routes/organizers');
const certificateRoutes = require('./routes/certificates');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigin = process.env.FRONTEND_URL || '*';

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({ origin: allowedOrigin }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/certificates', certificateRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Volunteer or organizer joins an activity chatroom
  socket.on('join_room', (activityId) => {
    socket.join(activityId);
    console.log(`User ${socket.id} joined activity room: ${activityId}`);
  });

  // Handle message sending
  socket.on('send_message', async (data) => {
    const { activityId, senderEmail, senderRole, message } = data;
    
    if (!activityId || !senderEmail || !message) return;

    const newMessage = {
      id: Date.now().toString(),
      activityId,
      senderEmail,
      senderRole,
      message,
      timestamp: new Date().toISOString()
    };

    try {
      // Persist message in database
      const messages = await readData('messages.json');
      messages.push(newMessage);
      await writeData('messages.json', messages);

      // Broadcast to other users in the same room
      io.to(activityId).emit('receive_message', newMessage);
    } catch (err) {
      console.error('Error saving or broadcasting chat message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  try {
    await verifyAndInitializeDatabases();
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database and start server:', error);
    process.exit(1);
  }
};

startServer();
