const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const apiRoutes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ''))
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow in development or if origin matches configured allowed origins or wildcard
    if (
      process.env.NODE_ENV !== 'production' ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(normalizedOrigin) ||
      // Support all Vercel deployments (*.vercel.app) if allowedOrigins includes any vercel domain or explicitly permitted
      (allowedOrigins.some(o => o.includes('.vercel.app')) && normalizedOrigin.endsWith('.vercel.app')) ||
      normalizedOrigin.includes('localhost') ||
      normalizedOrigin.includes('127.0.0.1')
    ) {
      return callback(null, true);
    }

    console.warn(`⚠️ Blocked by CORS: Origin ${origin} is not in allowed origins:`, allowedOrigins);
    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development Request Logger
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    database: 'MySQL',
    timestamp: new Date().toISOString()
  });
});

// Root API Welcome endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    name: 'AAA Tech Solutions API',
    version: '1.0.0',
    status: 'online'
  });
});

// Mount All REST API Routes
app.use('/api', apiRoutes);

// 404 Not Found Catch-All
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
