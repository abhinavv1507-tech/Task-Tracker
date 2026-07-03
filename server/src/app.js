/**
 * Express Application Configuration
 *
 * This file configures the Express app with all middleware and routes.
 * It does NOT start the server — that's index.js's responsibility.
 *
 * Why separate app.js from index.js?
 * - app.js exports the configured Express app
 * - index.js handles DB connection and server startup
 * - This separation makes the app testable (import app without starting server)
 * - It follows the "separation of concerns" principle
 *
 * Middleware order matters:
 * 1. Security middleware (helmet, cors, rate limiter) — first line of defense
 * 2. Parsing middleware (json, urlencoded) — parse request bodies
 * 3. Sanitization middleware (mongoSanitize, hpp) — clean parsed data
 * 4. Logging middleware (morgan) — log after security checks pass
 * 5. Routes — handle business logic
 * 6. Error handlers — catch anything that falls through
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

// Route imports
import taskRoutes from './routes/task.routes.js';

// Middleware imports
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

const app = express();

// ─── 1. Security Middleware ──────────────────────────────────────────

// Helmet: sets various HTTP security headers (X-Content-Type-Options,
// X-Frame-Options, Strict-Transport-Security, etc.)
app.use(helmet());

// CORS: configured for the frontend origin via env variable
const rawOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const allowedOrigin = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate Limiting: prevents brute-force and DoS attacks
// 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
});
app.use('/api', limiter);

// ─── 2. Parsing Middleware ───────────────────────────────────────────

// Parse JSON bodies (limit to 16kb to prevent payload attacks)
app.use(express.json({ limit: '16kb' }));

// Parse URL-encoded bodies (form submissions)
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// Serve static files from "public" directory
app.use(express.static('public'));

// ─── 3. Sanitization Middleware ──────────────────────────────────────

// Prevent NoSQL injection by stripping $ and . from req.body/query/params
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution (duplicate query params)
app.use(hpp());

// ─── 4. Logging Middleware ───────────────────────────────────────────

// Morgan: HTTP request logger
// 'dev' format in development, 'combined' (Apache-style) in production
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── 5. Routes ───────────────────────────────────────────────────────

// Root endpoint (prevents 404 errors in Render logs on pings)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to the TaskFlow API',
  });
});

// Health check endpoint
app.get('/api/v1/healthcheck', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Task routes
app.use('/api/v1/tasks', taskRoutes);

// ─── 6. Error Handling ───────────────────────────────────────────────

// 404 handler — must be after all routes
app.use(notFound);

// Global error handler — must be the LAST middleware
app.use(errorHandler);

export { app };
