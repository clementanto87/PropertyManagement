import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getUserDataLocations, anonymizeUserData, listAllUsers } from './service';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

// All routes require authentication and manager/admin role
router.use(authenticate);
router.use(authorize([Role.ADMIN, Role.MANAGER]));

// List all users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const users = await listAllUsers();
    res.json({ items: users });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: 'Failed to list users' });
  }
});

// Get user data locations for a specific user
router.get('/users/:userId/data-locations', async (req: Request, res: Response) => {
  try {
    const userId = z.string().cuid().parse(req.params.userId);
    const summary = await getUserDataLocations(userId);
    res.json(summary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Error getting user data locations:', error);
    res.status(500).json({ error: 'Failed to get user data locations' });
  }
});

// Anonymize user data
router.post('/users/:userId/anonymize', async (req: Request, res: Response) => {
  try {
    const userId = z.string().cuid().parse(req.params.userId);
    const actorId = (req as AuthRequest).user?.id;

    if (!actorId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Prevent self-anonymization (safety check)
    if (userId === actorId) {
      return res.status(400).json({ error: 'Cannot anonymize your own account' });
    }

    await anonymizeUserData(userId, actorId);
    res.json({ message: 'User data anonymized successfully' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    if (error instanceof Error && error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    console.error('Error anonymizing user data:', error);
    res.status(500).json({ error: 'Failed to anonymize user data' });
  }
});

export default router;

