// src/socket.js
import { io } from 'socket.io-client';

const socket = io('https://slotswapper-g46h.onrender.com', {
  withCredentials: true,
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;
