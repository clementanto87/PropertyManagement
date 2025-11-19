import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.use('/api', routes);

  app.use(errorHandler);
  return app;
};
