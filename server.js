const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
// const { Server } = require('socket.io'); // Commented out until dependencies are installed

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3003;

// When using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Socket.IO initialization
  try {
    const { Server } = require('socket.io');

    const io = new Server(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    io.on('connection', (socket) => {
      console.log('🏀 LaroHub: User connected:', socket.id);

      // Authentication middleware
      socket.on('authenticate', (data) => {
        // In a real app, verify the JWT token here
        socket.userId = data.userId;
        socket.emit('authenticated', { success: true });
        console.log(`User ${data.userId} authenticated with socket ${socket.id}`);
      });

      socket.on('join_room', (data) => {
        socket.join(data.room);
        console.log(`Socket ${socket.id} joined room: ${data.room}`);
        socket.emit('room_joined', { room: data.room });
      });

      socket.on('leave_room', (data) => {
        socket.leave(data.room);
        console.log(`Socket ${socket.id} left room: ${data.room}`);
        socket.emit('room_left', { room: data.room });
      });

      // Game-specific events
      socket.on('join_game', (data) => {
        const gameRoom = `game:${data.gameId}`;
        socket.join(gameRoom);
        socket.to(gameRoom).emit('player_joined', {
          gameId: data.gameId,
          userId: socket.userId,
          socketId: socket.id
        });
      });

      socket.on('leave_game', (data) => {
        const gameRoom = `game:${data.gameId}`;
        socket.to(gameRoom).emit('player_left', {
          gameId: data.gameId,
          userId: socket.userId,
          socketId: socket.id
        });
        socket.leave(gameRoom);
      });

      socket.on('disconnect', () => {
        console.log('🏀 LaroHub: User disconnected:', socket.id);
      });

      // Send welcome message
      socket.emit('welcome', {
        message: 'Welcome to LaroHub!',
        socketId: socket.id,
        timestamp: new Date().toISOString()
      });
    });

    console.log('🏀 LaroHub: Socket.IO server initialized successfully');
  } catch (error) {
    console.warn('⚠️ Socket.IO not available:', error.message);
    console.log('📱 LaroHub: Running without real-time features');
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Next.js server running on port ${port}`);
    });
});
