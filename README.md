# AI Startup Validator Web App

🧠 **AI-Powered Analysis** | ⚛️ **React + Tailwind** | 🖥️ **Node.js + Express** | 📊 **Dynamic Graphs** | 📁 **PDF Reports**

## Overview

The AI Startup Validator is a comprehensive web application that analyzes startup and project ideas using artificial intelligence. Users can submit their ideas and receive detailed analysis including:

- **Uniqueness Analysis**: How original is your idea?
- **Competitor Research**: Who's already in the market?
- **Market Viability**: What's the potential for success?
- **Risk Assessment**: What challenges might you face?
- **Actionable Insights**: Concrete next steps for your venture

## Features

- 🎯 **Intelligent Analysis**: Google Gemini AI provides deep insights
- 📈 **Visual Analytics**: Interactive charts and graphs using Recharts
- 📄 **Professional Reports**: Downloadable PDF reports with comprehensive analysis
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS
- ⚡ **Fast & Secure**: Express.js backend with optimized API endpoints

## Tech Stack

### Frontend
- **React.js** - Component-based UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Data visualization library
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Google Gemini** - AI/ML model for analysis
- **PDFKit** - PDF generation library
- **CORS** - Cross-origin resource sharing

## Project Structure

```
idea-validator/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── services/      # API service calls
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── controllers/       # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   └── package.json
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Google Gemini API key

### Installation

1. **Clone and setup the project**:
   ```bash
   git clone <repository-url>
   cd idea-validator
   ```

2. **Backend setup**:
   ```bash
   cd server
   npm install
   # Create .env file with your API keys
   cp .env.example .env
   npm run dev
   ```

3. **Frontend setup**:
   ```bash
   cd ../client
   npm install
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
NODE_ENV=development
```

## API Endpoints

- `POST /api/analyze` - Submit startup idea for analysis
- `GET /api/report/:id` - Download PDF report
- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues, please open a GitHub issue or contact the development team.
