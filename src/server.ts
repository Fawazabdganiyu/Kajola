import env from './config/environment';
import app from './app'
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import chatSocket from './sockets/chatSocket';

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*', // Allow all origins
  },
});

// Setup Socket.IO
chatSocket(io);

// Start the server
const PORT = env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
