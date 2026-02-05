// src/utils/socket.js
import { io } from 'socket.io-client';

const wsUrl = import.meta.env.VITE_WS_URL;
const socket = io(wsUrl, {
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
});

export const connectSocket = (handleWebSocketMessage) => {
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server');
  });

  socket.on('notification', handleWebSocketMessage);

  socket.on('disconnect', () => {
    console.log('Disconnected from Socket.IO server');
  });
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};

export default socket;
