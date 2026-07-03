/**
 * Server Entry Point
 *
 * This is the application's entry point. It:
 * 1. Loads environment variables (via dotenv — configured in package.json scripts)
 * 2. Connects to MongoDB
 * 3. Starts the Express server
 *
 * Why this pattern (from chai-backend)?
 * - connectDB() returns a promise
 * - We chain .then() to start the server ONLY after DB connects
 * - If DB fails, .catch() logs the error and process.exit(1) in connectDB handles it
 * - This guarantees the API never accepts requests without a DB connection
 */

import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    // Handle unhandled errors from Express
    app.on('error', (error) => {
      console.error('❌ Express error:', error);
      throw error;
    });

    app.listen(PORT, () => {
      console.log(`\n⚙️  Server is running at: http://localhost:${PORT}`);
      console.log(`📋 API base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/healthcheck`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed!', err);
    process.exit(1);
  });
