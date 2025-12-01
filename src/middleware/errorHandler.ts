import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'ValidationError', issues: err.issues });
  }
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({ error: 'InternalServerError', message });
}
