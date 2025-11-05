import { fileURLToPath } from 'url';
import path, { dirname, resolve } from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import swapRoutes from './routes/swaps.js';
import connectDB from './config/db.js';

// Setup __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

// Connect to MongoDB
await connectDB();

// Express app setup
const app = express();
const httpServer = createServer(app);

// Enable CORS for frontend (local and deployed)
app.use(cors({
  origin: ['http://localhost:3000', process.env.FRONTEND_URL],
  credentials: true,
}));

app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/swaps', swapRoutes);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', process.env.FRONTEND_URL],
    credentials: true,
  },
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🟢 New socket connected:', socket.id);

  socket.on('register', (userId) => {
    connectedUsers.set(userId, socket.id);
    console.log(`📌 Registered user ${userId} with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        break;
      }
    }
    console.log('🔴 Socket disconnected:', socket.id);
  });
});

app.set('io', io);
app.set('connectedUsers', connectedUsers);

// ✅ Serve React build from /build (Create React App)
const buildPath = path.join(__dirname, '../frontend/build');
app.use(express.static(buildPath));

// Wildcard route to support React Router
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
