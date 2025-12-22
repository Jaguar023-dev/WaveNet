#!/bin/bash

echo "🚀 Starting WaveNet Deployment..."

# Build client
echo "📦 Building client..."
cd client
npm run build
cd ..

# Build server
echo "⚙️ Building server..."
cd server
npm run build
cd ..

# Create deployment directory
echo "📁 Creating deployment package..."
mkdir -p deploy
cp -r server/dist deploy/
cp -r client/dist deploy/public
cp server/package.json deploy/
cp server/.env.production deploy/.env

# Copy necessary files
cp server/ecosystem.config.js deploy/
cp server/Dockerfile deploy/

echo "✅ Deployment package created!"
echo ""
echo "📦 Files in deploy directory:"
ls -la deploy/
echo ""
echo "🚀 To deploy to production:"
echo "1. cd deploy"
echo "2. npm install --production"
echo "3. npm start"
echo ""
echo "🐳 Or using Docker:"
echo "docker build -t wavenet ."
echo "docker run -p 5000:5000 wavenet"