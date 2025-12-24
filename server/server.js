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
// ADD VERIFICATION ROUTES - NEW LINE
const verificationRoutes = require('./routes/verification');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// FIX: Trust proxy for Render.com/Heroku/NGINX reverse proxies
// This MUST be set before rate limiting middleware
app.set('trust proxy', 1);

// Determine client URL based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Configure allowed origins for CORS
const allowedOrigins = [];
if (isProduction) {
  // Add your production frontend URLs
  allowedOrigins.push('https://wavenet-wlnf.onrender.com');
  // Add your custom domain if you have one
  // allowedOrigins.push('https://yourdomain.com');
} else {
  // Development origins
  allowedOrigins.push('http://localhost:3000');
  allowedOrigins.push('http://localhost:5173'); // Vite dev server
  allowedOrigins.push('http://localhost:8080');
}

// Get the primary client URL (first in the array)
const CLIENT_URL = allowedOrigins[0];

console.log('🌍 Environment:', isProduction ? 'Production' : 'Development');
console.log('🔗 Primary Client URL:', CLIENT_URL);
console.log('✅ Allowed Origins:', allowedOrigins);

// Configure Socket.io
const io = socketio(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling']
});

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skipFailedRequests: false,
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use the client's real IP (trust proxy handles this)
    return req.ip;
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // You might want to configure this properly for production
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(compression());

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ['Content-Disposition'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to API routes only
app.use('/api', limiter);

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wavenet';

// Function to create admin user (NON-BLOCKING)
const createAdminUser = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    
    console.log('🔐 Checking for admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@wavenet.com' },
        { username: 'WaveNet Support' }
      ] 
    });

    if (existingAdmin) {
      // Update existing admin to ensure correct role
      existingAdmin.role = 'super_admin';
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log('✅ Admin user already exists and updated');
      return;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('WaveNet@support1411', 10);
    
    const adminUser = new User({
      username: 'WaveNet Support',
      email: 'admin@wavenet.com',
      password: hashedPassword,
      role: 'super_admin',
      isVerified: true,
      profile: {
        firstName: 'WaveNet',
        lastName: 'Support',
        bio: 'Official WaveNet Administrator',
        location: 'Global',
        website: 'https://wavenet.com',
        profilePicture: {
          url: '/default-avatar.png'
        }
      },
      privacySettings: {
        profileVisibility: 'private',
        postVisibility: 'private',
        showOnlineStatus: false,
        allowFriendRequests: false,
        allowMessages: 'friends'
      }
    });

    await adminUser.save();
    console.log('🎉 Admin user created successfully!');
    console.log('   👤 Username: WaveNet Support');
    console.log('   📧 Email: admin@wavenet.com');
    console.log('   🔑 Password: WaveNet@support1411');
    console.log('   👑 Role: super_admin');
    console.log('   ✅ Verified: true');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    // Don't throw - just log and continue
  }
};

// Connect to database with proper error handling
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(async () => {
  console.log('✅ Connected to MongoDB');
  console.log(`📊 Database: ${MONGODB_URI.split('@').pop() || MONGODB_URI}`);
  
  // Try to create admin user, but don't block if it fails
  try {
    await createAdminUser();
  } catch (adminError) {
    console.error('⚠️  Admin creation failed (non-critical):', adminError.message);
    // Continue anyway - server should still work
  }
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('Attempting to continue without database...');
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    console.log(`👥 Socket ${socket.id} joined room: ${roomId}`);
  });
  
  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data);
    console.log(`💬 Message sent to room ${data.roomId} by ${socket.id}`);
  });
  
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('user-typing', data);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
// ADD VERIFICATION ROUTE - NEW LINE
app.use('/api/verification', verificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  const healthData = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mode: isProduction ? 'production' : 'development',
    client: CLIENT_URL,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    memory: process.memoryUsage(),
    nodeVersion: process.version
  };
  
  res.status(200).json(healthData);
});

// Admin check endpoint
app.get('/api/admin/check', async (req, res) => {
  try {
    const User = require('./models/User');
    const admin = await User.findOne({ 
      $or: [
        { email: 'admin@wavenet.com' },
        { username: 'WaveNet Support' }
      ] 
    });
    
    if (admin) {
      res.json({
        exists: true,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isVerified: admin.isVerified
      });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app in production
if (isProduction) {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  const clientIndexPath = path.join(clientBuildPath, 'index.html');
  
  // Check if React build exists
  if (fs.existsSync(clientBuildPath) && fs.existsSync(clientIndexPath)) {
    console.log('✅ Serving React build from:', clientBuildPath);
    
    // Serve static files
    app.use(express.static(clientBuildPath, {
      maxAge: '1y',
      etag: true,
      index: false
    }));
    
    // Handle React routing
    app.get('*', (req, res, next) => {
      // Skip API and Socket.io routes
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      
      // Serve index.html for all other routes
      console.log(`📄 Serving React for route: ${req.path}`);
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
        endpoints: {
          api: '/api',
          health: '/health',
          socket: '/socket.io',
          adminCheck: '/api/admin/check',
          verification: '/api/verification' // ADDED TO ENDPOINTS LIST
        },
        environment: {
          node_env: process.env.NODE_ENV,
          port: process.env.PORT
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
      client: `React app should be running on ${CLIENT_URL}`,
      instructions: 'Run the React dev server separately with: npm run dev',
      admin: {
        username: 'WaveNet Support',
        email: 'admin@wavenet.com',
        password: 'WaveNet@support1411',
        check: 'GET /api/admin/check'
      },
      api: {
        base: 'http://localhost:' + (process.env.PORT || 5000) + '/api',
        auth: '/api/auth',
        users: '/api/users',
        posts: '/api/posts',
        messages: '/api/messages',
        verification: '/api/verification', // ADDED TO API LIST
        socket: 'ws://localhost:' + (process.env.PORT || 5000)
      },
      links: {
        react_dev: CLIENT_URL,
        api_docs: 'http://localhost:' + (process.env.PORT || 5000) + '/health'
      }
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  // Handle CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: 'CORS Error: Origin not allowed',
      allowedOrigins: allowedOrigins,
      yourOrigin: req.headers.origin
    });
  }
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: isProduction ? {} : err.stack
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'API route not found',
    path: req.path,
    available: {
      auth: [
        'POST /api/auth/register',
        'POST /api/auth/login', 
        'GET /api/auth/me',
        'POST /api/auth/logout'
      ],
      users: 'GET /api/users',
      posts: 'GET /api/posts',
      messages: 'GET /api/messages',
      verification: 'GET /api/verification', // ADDED TO AVAILABLE ROUTES
      health: 'GET /health',
      adminCheck: 'GET /api/admin/check'
    }
  });
});

// Global 404 handler (for non-API routes in production)
app.use('*', (req, res) => {
  if (isProduction) {
    // In production, if React build exists, it should handle 404s
    const clientIndexPath = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(clientIndexPath)) {
      return res.sendFile(clientIndexPath);
    }
  }
  
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
    mode: isProduction ? 'production' : 'development'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('\n' + '='.repeat(50));
  console.log(`🚀 WaveNet server started on port ${PORT}`);
  console.log('='.repeat(50));
  console.log(`🌐 Environment: ${isProduction ? 'Production' : 'Development'}`);
  console.log(`🔗 Health endpoint: http://localhost:${PORT}/health`);
  console.log(`⚡ Socket.io: ws://localhost:${PORT}`);
  console.log(`🔒 Trust proxy: Enabled`);
  console.log(`🎯 Rate limiting: Enabled (100 requests/15min)`);
  
  if (isProduction) {
    console.log(`🎨 Frontend: ${CLIENT_URL}`);
    console.log(`📁 Serving React: ${fs.existsSync(path.join(__dirname, '../client/dist')) ? 'Yes' : 'No'}`);
  } else {
    console.log(`💻 React dev server: ${CLIENT_URL}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  }
  
  console.log('='.repeat(50) + '\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing server gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Don't exit in production, try to recover
  if (!isProduction) {
    process.exit(1);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});