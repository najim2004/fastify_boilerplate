import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { createSocketRedisAdapter } from './redis-adapter';

let io: Server | null = null;

export const initSocketServer = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  const adapter = createSocketRedisAdapter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  io.adapter(adapter as any);

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error('Socket.io has not been initialized');
  }
  return io;
};
