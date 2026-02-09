const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
// Attach optional auth middleware early so routes can access req.user when Authorization header present
const authMiddleware = require('./middleware/auth');
app.use(authMiddleware);

// Connect to MongoDB (if available)
try {
  const db = require('./db');
  db.connect();
} catch (e) {
  console.warn('MongoDB helper load failed:', e.message || e);
}
// Configure CORS to allow multiple origins. Use ALLOWED_ORIGINS (comma separated)
// or fall back to CLIENT_URL or localhost for development.
const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || 'http://localhost:3000';
const allowedOrigins = allowedOriginsEnv.split(',').map(o => o.trim()).filter(Boolean);

console.log('🔐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow non-browser requests like curl/postman (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // Not allowed
    const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
    return callback(new Error(msg), false);
  },
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// NOTE: auth middleware already attached earlier; avoid double-registration

// Routes
app.use('/api', require('./routes/index'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'AI Startup Validator API is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// SERVE STATIC FRONTEND FILES (Production)
// ============================================
// Serve React build files from ../client/build
const buildPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(buildPath));

// SPA fallback: serve index.html for all non-API routes
// This allows React Router to handle client-side routing
app.get(/^(?!\/api\/).*$/, (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({
        error: 'Not found',
        message: 'The requested resource does not exist'
      });
    }
  });
});

// Handle API 404s
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AI Startup Validator API running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔗 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});



module.exports = app;
