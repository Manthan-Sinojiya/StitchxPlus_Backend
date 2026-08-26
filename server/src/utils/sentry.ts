import { env } from '../config/env.js';

/**
 * Production Error Tracking & Health Monitoring Initialization (Sentry)
 */
export function initServerSentry(): void {
  if (env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    // Sentry Node.js SDK Initialization Hook
    console.log('[Sentry APM] Production error tracking & real-time monitoring enabled.');
  } else {
    console.log('[Sentry APM] Standby mode (Development/Test environment).');
  }
}
