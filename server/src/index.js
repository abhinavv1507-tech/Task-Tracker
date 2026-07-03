import dotenv from 'dotenv';
import https from 'https';
import connectDB from './config/db.js';
import { app } from './app.js';

// Load .env for local development. On Render, env vars come from the dashboard.
dotenv.config();

const PORT = process.env.PORT || 5000;

// ── Self-ping: keeps Render free tier awake ────────────────────────────────
// Pings /api/v1/healthcheck every 5 minutes.
// RENDER_EXTERNAL_URL is automatically set by Render (not present locally).
const startSelfPing = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return; // Skip in local development

  const FIVE_MINUTES = 5 * 60 * 1000;
  console.log(`⏱️  Self-ping active → ${url} (every 5 min)`);

  setInterval(() => {
    https
      .get(`${url}/api/v1/healthcheck`, (res) => {
        console.log(`✅ Ping ${res.statusCode} at ${new Date().toISOString()}`);
      })
      .on('error', (err) => {
        console.error(`❌ Ping failed: ${err.message}`);
      });
  }, FIVE_MINUTES);
};

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      startSelfPing();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
