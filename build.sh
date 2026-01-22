#!/bin/bash
# Build and prepare for production deployment

echo "🔨 Building frontend..."
cd client
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Frontend build failed"
  exit 1
fi

echo "✅ Frontend build successful!"
echo ""
echo "📦 Production build ready in client/build/"
echo ""
echo "Next steps for Render deployment:"
echo "1. Push changes to GitHub"
echo "2. Render will auto-build and deploy"
echo "3. Make sure build command is: 'cd client && npm install && npm run build'"
echo "4. Backend will automatically serve the frontend from client/build"
