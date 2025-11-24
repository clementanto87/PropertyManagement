import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all communications for the authenticated user (Property Manager)
router.get('/communications', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const { tenantId, limit, search, type, followUpOnly, startDate, endDate } = req.query;

    const where: any = tenantId ? { tenantId: tenantId as string } : { userId };
    
    // Add search filter
    if (search) {
      where.OR = [
        { summary: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { channel: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Add type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Add follow-up filter
    if (followUpOnly === 'true') {
      where.followUpRequired = true;
    }

    // Add date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

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
    const { search, type, followUpOnly } = req.query;
    const user = (req as AuthRequest).user!;

    // If user is a tenant, only allow them to see their own communications
    if (user.role === 'TENANT' && user.tenantId !== tenantId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where: any = { tenantId };

    // Add search filter
    if (search) {
      where.OR = [
        { summary: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { channel: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Add type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Add follow-up filter
    if (followUpOnly === 'true') {
      where.followUpRequired = true;
    }

    const communications = await prisma.communication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tenant: {
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

// Get communications for authenticated tenant (tenant-facing endpoint)
router.get('/communications/my-communications', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    
    if (user.role !== 'TENANT' || !user.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant account required.' });
    }

    const { search, type, followUpOnly } = req.query;

    const where: any = { tenantId: user.tenantId };

    // Add search filter
    if (search) {
      where.OR = [
        { summary: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
        { channel: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Add type filter
    if (type && type !== 'all') {
      where.type = type;
    }

    // Add follow-up filter
    if (followUpOnly === 'true') {
      where.followUpRequired = true;
    }

    const communications = await prisma.communication.findMany({
      where,
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
    res.json({ items: communications });
  } catch (error) {
    console.error('Error fetching tenant communications:', error);
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

// Get a single communication
router.get('/communications/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const communication = await prisma.communication.findUnique({
      where: { id },
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

    if (!communication) {
      return res.status(404).json({ error: 'Communication not found' });
    }

    res.json(communication);
  } catch (error) {
    console.error('Error fetching communication:', error);
    res.status(500).json({ error: 'Failed to fetch communication' });
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

    res.json(communication);
  } catch (error) {
    console.error('Error updating communication:', error);
    res.status(500).json({ error: 'Failed to update communication' });
  }
});

// Mark follow-up as complete
router.patch('/communications/:id/complete-followup', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const communication = await prisma.communication.update({
      where: { id },
      data: {
        followUpRequired: false,
        followUpDate: null,
      },
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

    res.json(communication);
  } catch (error) {
    console.error('Error completing follow-up:', error);
    res.status(500).json({ error: 'Failed to complete follow-up' });
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

// Send email to tenant
router.post('/send-email', authenticate, async (req: Request, res: Response) => {
  try {
    const { tenantId, templateId, subject, body, variables, logAsCommunication } = req.body;
    const userId = (req as AuthRequest).user!.id;

    // Import the service dynamically to avoid circular dependencies
    const { sendEmailToTenant } = await import('./communications/emailService');

    const result = await sendEmailToTenant(
      {
        tenantId,
        templateId,
        subject,
        body,
        variables,
        logAsCommunication: logAsCommunication !== false, // Default to true
      },
      userId
    );

    res.json(result);
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

export default router;
