// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const dotenv = require('dotenv');
const socketio = require('socket.io');
const http = require('http');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');


// Initialize Express app
const app = express();
const server = http.createServer(app);

// Determine client URL based on environment
const isProduction = process.env.NODE_ENV === 'production';
const CLIENT_URL = isProduction 
  ? `http://localhost:${process.env.PORT || 5000}`
  : process.env.CLIENT_URL || 'http://localhost:3000';

const io = socketio(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(compression());
app.use(cors({
  origin: CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Database connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Running in database-less mode with hardcoded users');
  });
} else {
  console.log('ℹ️  No MONGODB_URI provided, running in database-less mode');
}

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
  });
  
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
  });
  
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes); // Added admin routes

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: isProduction ? 'production' : 'development',
    database: dbStatus,
    client: CLIENT_URL,
    admin: {
      available: true,
      email: 'trustynewsnetworkkenya@gmail.com'
    }
  });
});

// Admin test endpoint (no auth required for testing)
app.get('/api/admin/test', (req, res) => {
  res.json({
    message: 'Admin API is working',
    adminCredentials: {
      email: 'trustynewsnetworkkenya@gmail.com',
      password: 'Derrick9786',
      note: 'Use these credentials to login as admin'
    },
    endpoints: {
      login: 'POST /api/auth/login',
      adminDashboard: 'GET /api/admin/dashboard (requires admin token)',
      adminUsers: 'GET /api/admin/users (requires admin token)'
    }
  });
});

// Serve React app in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  const clientIndexPath = path.join(clientBuildPath, 'index.html');
  
  // Check if React build exists
  if (fs.existsSync(clientBuildPath) && fs.existsSync(clientIndexPath)) {
    console.log('✅ Serving React build from:', clientBuildPath);
    
    // Serve static files
    app.use(express.static(clientBuildPath));
    
    // Handle React routing
    app.get('*', (req, res, next) => {
      // Skip API and Socket.io routes
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      
      // Serve index.html for all other routes
      res.sendFile(clientIndexPath);
    });
  } else {
    console.warn('⚠️  React build not found at:', clientBuildPath);
    console.log('Running in API-only mode');
    
    app.get('/', (req, res) => {
      res.json({
        message: 'WaveNet API Server',
        status: 'Running in API-only mode',
        build: 'React build not found',
        instructions: 'Build React app with: npm run build (in client directory)',
        admin: {
          login: 'POST /api/auth/login with admin credentials',
          test: 'GET /api/admin/test'
        },
        endpoints: {
          api: '/api',
          health: '/health',
          socket: '/socket.io'
        }
      });
    });
  }
} else {
  // Development mode - API only
  app.get('/', (req, res) => {
    res.json({
      message: 'WaveNet Development API Server',
      mode: 'development',
      client: 'React app should be running on ' + CLIENT_URL,
      admin: {
        credentials: 'trustynewsnetworkkenya@gmail.com / Derrick9786',
        login: 'POST /api/auth/login',
        test: 'GET /api/admin/test'
      },
      api: {
        base: '/api',
        auth: '/api/auth',
        users: '/api/users',
        posts: '/api/posts',
        messages: '/api/messages',
        admin: '/api/admin',
        socket: 'ws://localhost:' + (process.env.PORT || 5000)
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'API route not found',
    path: req.path,
    available: {
      auth: ['/api/auth/login', '/api/auth/register', '/api/auth/me'],
      users: '/api/users',
      posts: '/api/posts',
      messages: '/api/messages',
      admin: '/api/admin',
      health: '/health'
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 WaveNet server started on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`⚡ Socket.io: ws://localhost:${PORT}`);
  console.log(`👑 Admin: trustynewsnetworkkenya@gmail.com / Derrick9786`);
  console.log(`📊 Admin test: http://localhost:${PORT}/api/admin/test`);
  
  if (isProduction) {
    console.log(`🎨 Frontend: http://localhost:${PORT}`);
  } else {
    console.log(`💻 React dev server: ${CLIENT_URL}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
  }
});