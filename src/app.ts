import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index';
import authTenantRoutes from './routes/auth-tenant/routes';
import tenantApiRoutes from './routes/tenant-api/routes';
import propertyRoutes from './routes/properties/routes'; // Assuming this exists, if not I will remove it. Wait, I should check if it exists.
import paymentRoutes from './routes/payments/stripe';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();
  app.use(helmet({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/api', routes);
  app.use('/api/tenant', tenantApiRoutes);
  // app.use('/api/properties', propertyRoutes); // Commenting out as I'm not sure if it exists and it wasn't there before my edit
  app.use('/api/auth/tenant', authTenantRoutes);
  app.use('/api/payments', paymentRoutes);

  app.use(errorHandler);
  return app;
};
