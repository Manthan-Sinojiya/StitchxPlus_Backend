import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
    logger.info(`🏥 Health check available at http://localhost:${env.PORT}/health`);
  });
};

startServer().catch((err) => {
  logger.error(err, 'Failed to start server');
  process.exit(1);
});
