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
import https from 'https';
import connectDB from './config/db.js';
import { app } from './app.js';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;

// Self-ping function to keep Render Free Tier awake
const startSelfPing = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) {
    console.log('ℹ️ RENDER_EXTERNAL_URL not set. Skipping self-ping (running locally).');
    return;
  }

  // Ping every 10 minutes (Render free tier sleeps after 15 minutes of inactivity)
  const INTERVAL = 10 * 60 * 1000;

  console.log(`⏱️ Self-ping initialized. Target: ${url}`);

  setInterval(() => {
    try {
      https.get(`${url}/api/v1/healthcheck`, (res) => {
        if (res.statusCode === 200) {
          console.log(`✅ Self-ping successful: ${res.statusCode} at ${new Date().toISOString()}`);
        } else {
          console.warn(`⚠️ Self-ping returned status ${res.statusCode} at ${new Date().toISOString()}`);
        }
      }).on('error', (err) => {
        console.error('❌ Self-ping request error:', err.message);
      });
    } catch (err) {
      console.error('❌ Self-ping failed:', err.message);
    }
  }, INTERVAL);
};

connectDB()
  .then(() => {
    // Handle unhandled errors from Express
    app.on('error', (error) => {
      console.error('❌ Express error:', error);
      throw error;
    });

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n⚙️  Server is running at: http://localhost:${PORT}`);
      console.log(`📋 API base URL: http://localhost:${PORT}/api/v1`);
      console.log(`🏥 Health check: http://localhost:${PORT}/api/v1/healthcheck`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
      
      // Start the self-ping loop
      startSelfPing();
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed!', err);
    process.exit(1);
  });
