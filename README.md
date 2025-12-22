# WaveNet - Social Media Platform 🌊

WaveNet is a full-featured social media platform similar to Facebook, built with modern technologies.

## ✨ Features

### 🏠 **Core Features**
- **User Profiles**: Complete user profiles with bio, photos, education, work experience
- **Posts**: Create posts with text, images, videos, and privacy settings
- **Reactions**: Like, Love, Haha, Wow, Sad, Angry reactions
- **Comments & Replies**: Nested commenting system
- **Sharing**: Share posts with friends and groups
- **Hashtags & Mentions**: Tag topics and people
- **Privacy Controls**: Public/Friends/Only-me privacy settings

### 💬 **Real-time Communication**
- **Messenger**: Real-time chat with Socket.io (1-on-1 & group chats)
- **Video Calls**: Built-in video calling functionality
- **Voice Messages**: Send voice recordings
- **Typing Indicators**: See when others are typing
- **Read Receipts**: Message status tracking
- **Message Reactions**: React to messages with emojis

### 👥 **Social Features**
- **Friends System**: Send/accept friend requests, friend lists
- **Groups**: Create and join interest-based communities
- **Events**: Create and manage events with RSVP system
- **Pages**: Business and brand profiles
- **Marketplace**: Buy and sell items locally
- **Watch**: Video content hub with recommendations
- **Stories**: 24-hour ephemeral content with filters

### 🛡️ **Advanced Features**
- **Algorithm Feed**: Engagement-based post ranking algorithm
- **Notifications**: Real-time notifications for interactions
- **Search**: Full-text search across users, posts, groups
- **Analytics**: User and content analytics dashboard
- **Moderation Tools**: Reporting, blocking, content moderation
- **Live Streaming**: Broadcast live video to followers
- **Polls & Surveys**: Create interactive polls
- **Save for Later**: Bookmark posts and content

## 🏗️ Tech Stack

### **Backend**
- **Node.js** with **Express** - Server framework
- **MongoDB** with **Mongoose** - Database with ODM
- **Redis** - Caching and session storage
- **Socket.io** - Real-time communication
- **JWT** - Authentication and authorization
- **Cloudinary** - Media storage and processing
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Redis** - Rate limiting and caching

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling framework
- **Socket.io Client** - Real-time features
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Player** - Video player
- **Emoji Picker** - Emoji selection
- **React Dropzone** - File uploads

### **DevOps & Tools**
- **Docker** - Containerization
- **Redis** - Message broker and cache
- **Cloudinary** - CDN for media
- **Jest** - Testing framework
- **Swagger** - API documentation
- **ESLint & Prettier** - Code quality
- **GitHub Actions** - CI/CD

## 📁 Project Structure

# WaveNet - Social Media Platform 🌊

WaveNet is a full-featured social media platform similar to Facebook, built with modern technologies.

## ✨ Features

### 🏠 **Core Features**
- **User Profiles**: Complete user profiles with bio, photos, education, work experience
- **Posts**: Create posts with text, images, videos, and privacy settings
- **Reactions**: Like, Love, Haha, Wow, Sad, Angry reactions
- **Comments & Replies**: Nested commenting system
- **Sharing**: Share posts with friends and groups
- **Hashtags & Mentions**: Tag topics and people
- **Privacy Controls**: Public/Friends/Only-me privacy settings

### 💬 **Real-time Communication**
- **Messenger**: Real-time chat with Socket.io (1-on-1 & group chats)
- **Video Calls**: Built-in video calling functionality
- **Voice Messages**: Send voice recordings
- **Typing Indicators**: See when others are typing
- **Read Receipts**: Message status tracking
- **Message Reactions**: React to messages with emojis

### 👥 **Social Features**
- **Friends System**: Send/accept friend requests, friend lists
- **Groups**: Create and join interest-based communities
- **Events**: Create and manage events with RSVP system
- **Pages**: Business and brand profiles
- **Marketplace**: Buy and sell items locally
- **Watch**: Video content hub with recommendations
- **Stories**: 24-hour ephemeral content with filters

### 🛡️ **Advanced Features**
- **Algorithm Feed**: Engagement-based post ranking algorithm
- **Notifications**: Real-time notifications for interactions
- **Search**: Full-text search across users, posts, groups
- **Analytics**: User and content analytics dashboard
- **Moderation Tools**: Reporting, blocking, content moderation
- **Live Streaming**: Broadcast live video to followers
- **Polls & Surveys**: Create interactive polls
- **Save for Later**: Bookmark posts and content

## 🏗️ Tech Stack

### **Backend**
- **Node.js** with **Express** - Server framework
- **MongoDB** with **Mongoose** - Database with ODM
- **Redis** - Caching and session storage
- **Socket.io** - Real-time communication
- **JWT** - Authentication and authorization
- **Cloudinary** - Media storage and processing
- **Multer** - File upload handling
- **Bcrypt** - Password hashing
- **Nodemailer** - Email notifications
- **Redis** - Rate limiting and caching

### **Frontend**
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Navigation
- **Tailwind CSS** - Styling framework
- **Socket.io Client** - Real-time features
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **React Player** - Video player
- **Emoji Picker** - Emoji selection
- **React Dropzone** - File uploads

### **DevOps & Tools**
- **Docker** - Containerization
- **Redis** - Message broker and cache
- **Cloudinary** - CDN for media
- **Jest** - Testing framework
- **Swagger** - API documentation
- **ESLint & Prettier** - Code quality
- **GitHub Actions** - CI/CD

## 📁 Project Structure
wavenet/
├── client/ # Frontend React application
│ ├── public/ # Static assets
│ └── src/ # Source code
│ ├── components/ # Reusable components
│ ├── pages/ # Page components
│ ├── store/ # Redux store
│ ├── utils/ # Utility functions
│ └── App.jsx # Main app component
│
├── server/ # Backend Node.js application
│ ├── models/ # MongoDB models
│ ├── routes/ # API routes
│ ├── middleware/ # Custom middleware
│ ├── utils/ # Utility functions
│ └── server.js # Entry point
│
├── docker-compose.yml # Docker orchestration
├── .env.example # Environment variables template
├── README.md # This file
└── package.json # Root package.json

text

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB 5+
- Redis 6+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/wavenet.git
cd wavenet
Set up environment variables

bash
cp .env.example .env
# Edit .env with your configuration
Install dependencies

bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
Set up databases

bash
# Using Docker (recommended)
docker-compose up mongodb redis -d

# Or install manually
# MongoDB: https://docs.mongodb.com/manual/installation/
# Redis: https://redis.io/download
Run the application

bash
# Start the backend server (from server directory)
npm run dev

# Start the frontend (from client directory)
npm run dev
Access the application

Frontend: http://localhost:3000

Backend API: http://localhost:5000

API Documentation: http://localhost:5000/api-docs

🐳 Docker Deployment
Quick Start with Docker
bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d
Services
wavenet-client: React frontend (port 3000)

wavenet-server: Node.js backend (port 5000)

mongodb: MongoDB database (port 27017)

redis: Redis cache (port 6379)

📚 API Documentation
API documentation is available at /api-docs when the server is running. It includes:

Authentication endpoints

User management

Post operations

Messaging API

Group management

Marketplace endpoints

🔧 Environment Variables
Server (.env)
env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/wavenet
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_password

# OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
🧪 Testing
bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test

# Run with coverage
npm run test:coverage
📦 Deployment
Deploy to Render
Push code to GitHub

Connect repository to Render

Use provided render.yaml

Add environment variables

Deploy to Vercel (Frontend)
bash
cd client
vercel
Deploy to Railway (Backend)
bash
railway up
🔒 Security Features
JWT Authentication: Stateless token-based auth

Password Hashing: Bcrypt with salt rounds

Rate Limiting: API rate limiting with Redis

Input Validation: Server-side validation

CORS: Configured CORS policy

Helmet: Security headers

SQL Injection Prevention: MongoDB injection protection

XSS Protection: Input sanitization

📊 Performance Features
Redis Caching: Frequently accessed data

Image Optimization: Cloudinary transformations

Lazy Loading: Component and image lazy loading

Code Splitting: Dynamic imports

CDN: Static assets via Cloudinary

Database Indexing: Optimized queries

Connection Pooling: Database connections

🤝 Contributing
Fork the repository

Create a feature branch

Commit your changes

Push to the branch

Create a Pull Request

Development Guidelines
Follow the existing code style

Write meaningful commit messages

Add tests for new features

Update documentation

Use ESLint and Prettier

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Inspired by Facebook's social features

Built with amazing open-source technologies

Community contributions welcome

📞 Support
For support, email support@wavenet.com or create an issue in the GitHub repository.

Built with ❤️ by the WaveNet Team $ kenyan Jaguar 

