import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { globalRateLimiter } from './middlewares/rateLimiter.js';
import routes from './routes/index.js';
import { HealthController } from './controllers/health.controller.js';

const app = express();

// Trust reverse proxy (essential for Render / Cloudflare deployment)
app.set('trust proxy', 1);

// 1. CORS Configuration (MUST be placed before rate limiter so 429 errors include CORS headers)
const allowedOrigins = [
  env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        env.NODE_ENV === 'development' ||
        (origin && origin.endsWith('.onrender.com'))
      ) {
        callback(null, origin || true);
      } else {
        callback(null, origin || true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Session-ID',
      'X-Refresh-Token',
      'x-session-id',
      'x-refresh-token',
    ],
  }),
);

// 2. Security Headers
app.use(helmet());

// 3. Global Rate Limiting Middleware
app.use(globalRateLimiter);

// Cookie Parser Middleware
app.use(cookieParser());

import { sanitizeInputs } from './middlewares/sanitize.middleware.js';

// Body Parsing Middleware
app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true }));

// NoSQL Injection & Input Sanitization Middleware
app.use(sanitizeInputs);

// Request Logging Middleware
app.use(requestLogger);

// Direct /, /health, /robots.txt, and /sitemap.xml Endpoints
app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Stitchx Plus API Gateway',
    status: 'online',
    health: '/health',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

const healthController = new HealthController();
app.get('/health', healthController.getHealth);

import { SEOController } from './controllers/seo.controller.js';
app.get('/robots.txt', SEOController.getRobotsTxt);
app.get('/sitemap.xml', SEOController.getSitemapXml);

// API Routes
app.use('/api', routes);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
