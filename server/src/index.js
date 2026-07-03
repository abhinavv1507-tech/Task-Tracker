import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { app } from './app.js';

// Load .env for local development. On Render, env vars come from the dashboard.
dotenv.config();

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  });
