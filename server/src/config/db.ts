import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(
      `MongoDB Connection Note: Could not connect to ${env.MONGODB_URI} (${(error as Error).message}). Server will continue running for development.`,
    );
  }
};
