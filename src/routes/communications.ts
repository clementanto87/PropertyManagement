import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all communications for the authenticated user (Property Manager)
router.get('/communications', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { tenantId, limit } = req.query;

    const where: any = tenantId ? { tenantId: tenantId as string } : { userId };
    const take = limit ? parseInt(limit as string) : undefined;

    const communications = await prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      ...(take && { take }),
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json({ items: communications });
  } catch (error) {
    console.error('Error fetching all communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Get all communications for a tenant
router.get('/tenants/:tenantId/communications', authenticate, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const communications = await prisma.communication.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    res.json(communications);
  } catch (error) {
    console.error('Error fetching communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Create a new communication
router.post('/communications', authenticate, async (req: Request, res: Response) => {
  try {
    const { tenantId, type, channel, summary, content, followUpRequired, followUpDate } = req.body;
    const userId = (req as AuthRequest).user!.id;

    const communication = await prisma.communication.create({
      data: {
        tenantId,
        userId,
        type,
        channel,
        summary,
        content,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json(communication);
  } catch (error) {
    console.error('Error creating communication:', error);
    res.status(500).json({ error: 'Failed to create communication' });
  }
});

// Update a communication
router.put('/communications/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { type, channel, summary, content, followUpRequired, followUpDate } = req.body;

    const communication = await prisma.communication.update({
      where: { id },
      data: {
        type,
        channel,
        summary,
        content,
        followUpRequired: followUpRequired || false,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(communication);
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ error: 'Failed to update communication' });
  }
});

// Delete a communication
router.delete('/communications/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.communication.delete({
      where: { id },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting communication:', error);
    res.status(500).json({ error: 'Failed to delete communication' });
  }
});

export default router;
