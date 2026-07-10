/**
 * Express App Configuration
 * Sets up middleware, security, and routes.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { publicLimiter, authenticatedLimiter } from './middleware/rateLimiter';
import { authenticateOptional } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import customerRoutes from './modules/customers/customer.routes';
import productRoutes from './modules/products/product.routes';
import categoryRoutes from './modules/categories/category.routes';
import pricingRoutes from './modules/pricing/pricing.routes';
import orderRoutes from './modules/orders/order.routes';
import reportRoutes from './modules/reports/report.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import settingsRoutes from './modules/settings/settings.routes';

export const app = express();

// ---- Security Middleware ----
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Dynamically allow any origin (localhost, ngrok tunnels, mobile LAN IPs, desktop app, or no origin)
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ---- General Middleware ----
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(authenticateOptional);
app.use(publicLimiter);
app.use(authenticatedLimiter);
app.use(requestLogger);

// ---- Health Check ----
app.get(['/health', '/api/v1/health'], (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ---- API Routes ----
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/categories`, categoryRoutes);
app.use(`${API_PREFIX}/pricing`, pricingRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/settings`, settingsRoutes);

// ---- 404 Handler ----
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---- Global Error Handler ----
app.use(errorHandler);
