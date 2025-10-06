# AI Startup Validator - Setup Guide

## Quick Start Instructions

### Prerequisites
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Google Gemini API Key** - [Get from Google AI Studio](https://makersuite.google.com/app/apikey)

### 🚀 Installation Steps

1. **Navigate to the project directory**:
   ```bash
   cd idea-validator
   ```

2. **Setup Backend (Server)**:
   ```bash
   cd server
   npm install
   ```

3. **Create environment file**:
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

4. **Start the backend server**:
   ```bash
   npm run dev
   ```
   Server will run at: http://localhost:5000

5. **Setup Frontend (Client)** - Open a new terminal:
   ```bash
   cd ../client
   npm install
   ```

6. **Start the frontend**:
   ```bash
   npm start
   ```
   Frontend will run at: http://localhost:3000

### 🎯 Quick Test

1. Open http://localhost:3000 in your browser
2. Click "Start Free Analysis"
3. Fill in your startup idea details
4. Submit and wait for AI analysis
5. View results and download PDF report

## API Endpoints

### Health Check
- `GET /health` - Check if server is running

### Analysis
- `POST /api/analyze` - Submit startup idea for analysis
- `GET /api/analyze/:id` - Get analysis results by ID

### Reports  
- `GET /api/reports/:id` - Download PDF report

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=your_google_gemini_api_key_here
```

### Frontend (.env) - Optional
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Project Structure
```
idea-validator/
├── server/           # Backend (Node.js + Express)
│   ├── controllers/  # Route handlers
│   ├── services/     # Business logic & AI integration
│   ├── routes/       # API routes
│   ├── utils/        # Helper functions
│   └── middleware/   # Request validation
├── client/           # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/      # Main application pages
│   │   ├── services/   # API service calls
│   │   └── types/      # TypeScript definitions
│   └── public/
└── README.md
```

## Troubleshooting

### Backend Issues
- **Port 5000 already in use**: Change `PORT` in `.env` file
- **API key error**: Verify your Gemini API key is correct
- **Module not found**: Run `npm install` in server directory

### Frontend Issues
- **Port 3000 in use**: React will prompt to use different port
- **API connection failed**: Ensure backend is running on port 5000
- **Build errors**: Run `npm install` in client directory

### Common Solutions
1. **Clear node_modules**: Delete and reinstall
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Check API key**: Test with a simple request
   ```bash
   curl -X GET http://localhost:5000/health
   ```

3. **Network issues**: Disable firewall/antivirus temporarily

## Development

### Backend Development
```bash
cd server
npm run dev    # Starts with nodemon for auto-restart
```

### Frontend Development  
```bash
cd client
npm start      # Starts React development server
```

### Building for Production
```bash
# Backend
cd server && npm start

# Frontend
cd client && npm run build
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure API keys are correctly configured
4. Check console logs for specific error messages

## Next Steps

Once running successfully:
1. Customize the AI prompts in `server/services/geminiService.js`
2. Add more form fields in `client/src/pages/Analysis.tsx`
3. Enhance PDF reports in `server/services/pdfService.js`
4. Deploy to your preferred hosting platform
