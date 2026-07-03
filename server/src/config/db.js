/**
 * Database Connection
 *
 * Inspired by chai-backend's connectDB pattern.
 * Uses an async function that returns the connection instance,
 * allowing the caller (index.js) to chain .then()/.catch() for
 * clean startup sequencing.
 *
 * Why a separate file?
 * - Single Responsibility: DB connection logic is isolated
 * - Reusable: can be imported anywhere (e.g., for seeding scripts)
 * - Testable: can be mocked in tests without touching app.js
 */

import mongoose from 'mongoose';


const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log(
      `\n✅ MongoDB connected! DB HOST: ${connectionInstance.connection.host}`
    );

    return connectionInstance;
  } catch (error) {
    console.error('❌ MongoDB connection FAILED:', error.message);
    process.exit(1);
  }
};

export default connectDB;
