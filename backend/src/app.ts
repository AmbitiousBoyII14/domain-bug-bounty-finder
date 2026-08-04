import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import targetRoutes from './routes/targets';
import scanRoutes from './routes/scans';
import dnsRoutes from './routes/dns';
import certRoutes from './routes/certificates';
import techRoutes from './routes/technologies';
import subdomainRoutes from './routes/subdomains';
import reportRoutes from './routes/reports';
import userRoutes from './routes/users';
import adminRoutes from './routes/admin';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGINS.split(','), credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== 'test') app.use(morgan('short'));

app.use('/api/', generalLimiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup({
  openapi: '3.0.0',
  info: { title: 'Domain Bug Bounty Finder API', version: '1.0.0', description: 'API for the Domain Bug Bounty Finder platform' },
  servers: [{ url: env.API_URL }],
  components: { securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } } },
  paths: {},
}));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Domain Bug Bounty Finder API', version: '1.0.0', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/targets', targetRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/dns', dnsRoutes);
app.use('/api/certificates', certRoutes);
app.use('/api/technologies', techRoutes);
app.use('/api/subdomains', subdomainRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
