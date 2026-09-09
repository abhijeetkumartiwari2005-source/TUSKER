import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import { redisClient, redisConfig } from './config/redis.js';
import authRoutes from './routes/auth.js';
import campaignRoutes from './routes/campaigns.js';
import csvUploadRoutes from './routes/csvUpload.js';

const app = express();
const PORT = process.env.PORT || 5000;

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(express.json());
connectDB();

app.use('/auth', authRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/campaigns', csvUploadRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Tusker API running' });
});

// Socket.io: handle client connections
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-campaign', (campaignId) => {
    socket.join(`campaign:${campaignId}`);
    console.log(`Socket ${socket.id} joined campaign: ${campaignId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Subscribe to Redis Pub/Sub for worker progress
const subscriber = redisClient.duplicate();
await subscriber.connect();

subscriber.pSubscribe('campaign:*:progress');

subscriber.on('pmessage', (pattern, channel, message) => {
  const campaignId = channel.split(':')[1];
  const progressData = JSON.parse(message);
  
  io.to(`campaign:${campaignId}`).emit('progress', progressData);
  console.log(`[${campaignId}] Progress: ${progressData.sent}/${progressData.total}`);
});

console.log('Redis subscriber listening for campaign progress...');

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});