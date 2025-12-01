import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { login, register } from './service';
import { loginSchema, registerSchema } from './validation';
import { verifyGoogleToken, loginOrRegisterWithGoogle } from './googleService';
import { verifyMicrosoftToken, loginOrRegisterWithMicrosoft } from './microsoftService';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const result = await login(parse.data);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Login failed';
    res.status(401).json({ error: 'AuthenticationError', message });
  }
});

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const result = await register(parse.data);
    res.status(201).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Registration failed';
    res.status(400).json({ error: 'RegistrationError', message });
  }
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    // The user is already attached to the request by the authenticate middleware
    // We just need to cast it to the correct type or access it safely
    const user = (req as any).user;

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/google/config', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  res.json({
    configured: !!clientId,
    clientIdLength: clientId?.length || 0,
    clientIdPrefix: clientId ? clientId.substring(0, 20) + '...' : 'not set'
  });
});

router.post('/google', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      idToken: z.string().min(1, 'Google ID token is required')
    });

    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    logger.info({
      idTokenLength: parse.data.idToken.length,
      idTokenPrefix: parse.data.idToken.substring(0, 50) + '...',
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID
    }, 'Attempting Google token verification');

    // Verify Google token
    const googleData = await verifyGoogleToken(parse.data.idToken);

    logger.info({ email: googleData.email }, 'Google token verified successfully');

    // Login or register user
    const result = await loginOrRegisterWithGoogle(googleData);

    res.json(result);
  } catch (err) {
    logger.error({
      err,
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    }, 'Google authentication failed');
    const message = err instanceof Error ? err.message : 'Google authentication failed';
    logger.error({
      err,
      errorMessage: message,
      stack: err instanceof Error ? err.stack : undefined
    }, 'Google authentication failed in route handler');
    res.status(401).json({ error: 'GoogleAuthError', message });
  }
});

router.post('/microsoft', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      accessToken: z.string().min(1, 'Microsoft access token is required')
    });

    const parse = schema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    // Verify Microsoft token
    const microsoftData = await verifyMicrosoftToken(parse.data.accessToken);

    // Login or register user
    const result = await loginOrRegisterWithMicrosoft(microsoftData);

    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Microsoft authentication failed';
    res.status(401).json({ error: 'MicrosoftAuthError', message });
  }
});

export default router;
