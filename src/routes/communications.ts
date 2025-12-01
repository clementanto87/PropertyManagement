import { Router, Request, Response } from 'express';
import { PrismaClient, CommunicationDirection } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all communications
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const { tenantId, limit, search, type, followUpOnly, startDate, endDate } = req.query;

    let where: any = {};

    if (tenantId) {
      where.tenantId = tenantId as string;
    }

    // RBAC Logic
    if (user.role === 'MANAGER') {
      const managerFilter = {
        leases: {
          some: {
            unit: {
              OR: [
                { managers: { some: { id: user.id } } },
                { property: { managers: { some: { id: user.id } } } }
              ]
            }
          }
        }
      };

      if (tenantId) {
        // Verify access to specific tenant
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId as string,
            ...managerFilter
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      } else {
        // Filter all communications
        where.OR = [
          { userId: user.id }, // Created by manager
          { tenant: managerFilter } // Or belonging to managed tenant
        ];
      }
    } else if (user.role === 'TENANT') {
      if (user.tenantId !== tenantId && !tenantId) {
        where.tenantId = user.tenantId;
      } else if (user.tenantId !== tenantId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (user.role === 'CARETAKER') {
      // Caretakers only see their own communications for now
      where.userId = user.id;
      if (tenantId) {
        // Verify access to tenant (optional, but good practice)
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId as string,
            leases: {
              some: {
                unit: {
                  OR: [
                    { caretakers: { some: { id: user.caretakerId! } } },
                    { property: { caretakers: { some: { id: user.caretakerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      }
    } else if (user.role === 'HOUSEOWNER') {
      // House Owners only see their own communications
      where.userId = user.id;
      if (tenantId) {
        // Verify access to tenant
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId as string,
            leases: {
              some: {
                unit: {
                  OR: [
                    { houseOwners: { some: { id: user.houseOwnerId! } } },
                    { property: { houseOwners: { some: { id: user.houseOwnerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      }
    }
    // Admin sees all (no extra filter)

    // Add search filter
    if (search) {
      const searchFilter = {
        OR: [
          { summary: { contains: search as string, mode: 'insensitive' } },
          { content: { contains: search as string, mode: 'insensitive' } },
          { channel: { contains: search as string, mode: 'insensitive' } },
        ]
      };
      // Merge with existing OR if present
      if (where.OR) {
        where.AND = [
          { OR: where.OR },
          searchFilter
        ];
        delete where.OR;
      } else {
        where = { ...where, ...searchFilter };
      }
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
        const end = new Date(endDate as string);
        if (endDate.toString().length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
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
router.get('/tenants/:tenantId', authenticate, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { search, type, followUpOnly, startDate, endDate } = req.query;
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

    // Add date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        // Set end date to end of day if it's just a date string
        const end = new Date(endDate as string);
        if (endDate.toString().length === 10) { // YYYY-MM-DD
          end.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
      }
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
router.get('/my-communications', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;

    if (user.role !== 'TENANT' || !user.tenantId) {
      return res.status(403).json({ error: 'Access denied. Tenant account required.' });
    }

    const { search, type, followUpOnly, startDate, endDate } = req.query;

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

    // Add date range filter
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        if (endDate.toString().length === 10) {
          end.setHours(23, 59, 59, 999);
        }
        where.createdAt.lte = end;
      }
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
    res.json(communications);
  } catch (error) {
    console.error('Error fetching tenant communications:', error);
    res.status(500).json({ error: 'Failed to fetch communications' });
  }
});

// Create a new communication
router.post('/', authenticate, async (req: Request, res: Response) => {
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
router.get('/:id', authenticate, async (req: Request, res: Response) => {
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
router.put('/:id', authenticate, async (req: Request, res: Response) => {
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
router.patch('/:id/complete-followup', authenticate, async (req: Request, res: Response) => {
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
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
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

// --- Messaging Endpoints ---

// Get messages (conversation)
router.get('/messages/list', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const { tenantId } = req.query;

    let targetTenantId: string;

    if (user.role === 'TENANT') {
      if (!user.tenantId) {
        return res.status(403).json({ error: 'Tenant ID not found for user' });
      }
      targetTenantId = user.tenantId;
    } else {
      // Manager/Admin
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required for managers' });
      }
      targetTenantId = tenantId as string;

      if (user.role === 'MANAGER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: targetTenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { managers: { some: { id: user.id } } },
                    { property: { managers: { some: { id: user.id } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      } else if (user.role === 'CARETAKER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: targetTenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { caretakers: { some: { id: user.caretakerId! } } },
                    { property: { caretakers: { some: { id: user.caretakerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      } else if (user.role === 'HOUSEOWNER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: targetTenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { houseOwners: { some: { id: user.houseOwnerId! } } },
                    { property: { houseOwners: { some: { id: user.houseOwnerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      }
    }

    const messages = await prisma.communication.findMany({
      where: {
        tenantId: targetTenantId,
        type: 'MESSAGE',
      },
      orderBy: {
        createdAt: 'asc', // Oldest first for chat history
      },
      include: {
        user: {
          select: { id: true, name: true, role: true },
        },
        tenant: {
          select: { id: true, name: true },
        },
      },
    });

    // Auto-mark notifications as read since user is viewing the chat
    if (user.role === 'TENANT') {
      await prisma.notification.updateMany({
        where: {
          tenantId: user.tenantId,
          userId: null, // Strict filter
          type: 'MESSAGE',
          isRead: false,
        },
        data: { isRead: true },
      });
    } else {
      // Manager viewing tenant's messages
      // We skip auto-read for managers for now because we can't easily distinguish 
      // which tenant sent the message in the generic "New message" notifications 
      // without potentially clearing notifications from other tenants.
      /*
      await prisma.notification.updateMany({
        where: {
          userId: user.id,
          tenantId: null, // Strict filter
          type: 'MESSAGE',
          isRead: false,
          // We might want to filter by sender (the tenant) if we stored senderId in metadata
          // But for now, if manager opens chat with Tenant X, we should probably only clear Tenant X's notifications?
          // The current notification system for managers is generic "New message from Tenant".
          // If we clear ALL message notifications, it might clear notifications from Tenant Y too.
          // Let's check if we can filter by metadata?
          // The creation logic stores: title: `New message from ${senderName}`
          // It doesn't seem to store tenantId in a queryable way for Managers (userId is set, tenantId is null).
          // Wait, the notification model has tenantId.
          // For Manager notifications, we set userId = manager.id. Do we set tenantId?
          // In POST /messages (Inbound):
          // data: { userId: manager.id, title: ..., tenantId: ??? }
          // It does NOT set tenantId for Manager notifications.
          // So we can't easily distinguish which tenant sent the message unless we parse the title or use metadata.
          // Ideally, we should store the related tenantId in metadata or a new field.
          // For now, to be safe, we won't auto-clear Manager notifications to avoid clearing unrelated ones,
          // OR we accept that opening *any* chat might not be enough context.
          // BUT, for Tenants, it's safe (they only have one chat).
        },
        data: { isRead: true },
      });
      */

      // Refined logic for Managers:
      // Since we can't filter by tenant easily without schema changes or metadata queries (which updateMany doesn't support well on JSON),
      // We will skip auto-read for managers for now, OR we can try to find notifications with specific titles? Too brittle.
      // Actually, let's look at how we create Manager notifications.
      // We set `userId`. We leave `tenantId` null.
      // If we want to support per-tenant notification clearing for managers, we SHOULD set `tenantId` even for manager notifications?
      // But `tenantId` in Notification model is a relation to Tenant.
      // If we set it, then the "Strict Filter" I added (userId matches AND tenantId is null) would fail.
      // So my previous fix might have been too aggressive if we *wanted* to store tenantId.
      // But the previous code didn't set tenantId for manager notifications anyway.

      // Let's stick to auto-clearing for TENANTS only for now, as that seems to be the user's primary complaint context (app chat).
    }

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a message
router.post('/messages', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user!;
    const { content, tenantId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    let direction: CommunicationDirection;
    let targetTenantId: string;
    let userId: string | null = null;
    let senderName: string;

    if (user.role === 'TENANT') {
      if (!user.tenantId) {
        return res.status(403).json({ error: 'Tenant ID not found for user' });
      }
      direction = 'INBOUND';
      targetTenantId = user.tenantId;
      senderName = user.name || 'Tenant';
      // userId remains null for tenant-sent messages (or could be linked if we want)
    } else {
      // Manager/Admin/Caretaker
      if (!tenantId) {
        return res.status(400).json({ error: 'Tenant ID is required for staff' });
      }

      // RBAC Check
      if (user.role === 'MANAGER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { managers: { some: { id: user.id } } },
                    { property: { managers: { some: { id: user.id } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      } else if (user.role === 'CARETAKER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { caretakers: { some: { id: user.caretakerId! } } },
                    { property: { caretakers: { some: { id: user.caretakerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      } else if (user.role === 'HOUSEOWNER') {
        const hasAccess = await prisma.tenant.findFirst({
          where: {
            id: tenantId,
            leases: {
              some: {
                unit: {
                  OR: [
                    { houseOwners: { some: { id: user.houseOwnerId! } } },
                    { property: { houseOwners: { some: { id: user.houseOwnerId! } } } }
                  ]
                }
              }
            }
          }
        });
        if (!hasAccess) return res.status(403).json({ error: 'Access denied to this tenant' });
      }

      direction = 'OUTBOUND';
      targetTenantId = tenantId;
      userId = user.id;
      senderName = user.name || (user.role === 'CARETAKER' ? 'Caretaker' : (user.role === 'HOUSEOWNER' ? 'House Owner' : 'Property Manager'));
    }

    const message = await prisma.communication.create({
      data: {
        tenantId: targetTenantId,
        userId,
        type: 'MESSAGE',
        channel: 'APP',
        summary: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        content,
        direction,
        isRead: false,
      },
    });

    // Send Notification
    // Import dynamically to avoid circular dependency issues if any
    const { sendNewMessageNotification } = await import('./communications/emailService');

    if (direction === 'OUTBOUND') {
      // Notify Tenant
      const existingNotification = await prisma.notification.findFirst({
        where: {
          tenantId: targetTenantId,
          userId: null, // Ensure we don't pick up manager notifications
          type: 'MESSAGE',
          isRead: false,
        },
      });

      if (existingNotification) {
        const currentCount = (existingNotification.metadata as any)?.count || 1;
        await prisma.notification.update({
          where: { id: existingNotification.id },
          data: {
            title: `You have ${currentCount + 1} new messages`,
            message: `Latest: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
            metadata: { count: currentCount + 1 },
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.notification.create({
          data: {
            tenantId: targetTenantId,
            title: `New message from ${senderName}`,
            message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
            type: 'MESSAGE',
            metadata: { count: 1 },
          },
        });
      }
    } else {
      // Notify Manager(s)
      const managers = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'MANAGER'] } },
        select: { id: true },
      });

      // Process each manager independently
      await Promise.all(managers.map(async (manager) => {
        const existingNotification = await prisma.notification.findFirst({
          where: {
            userId: manager.id,
            tenantId: null, // Ensure we don't pick up tenant notifications
            type: 'MESSAGE',
            isRead: false,
          },
        });

        if (existingNotification) {
          const currentCount = (existingNotification.metadata as any)?.count || 1;
          await prisma.notification.update({
            where: { id: existingNotification.id },
            data: {
              title: `You have ${currentCount + 1} new messages`,
              message: `Latest from ${senderName}: ${content.substring(0, 50)}${content.length > 50 ? '...' : ''}`,
              metadata: { count: currentCount + 1, tenantId: targetTenantId },
              updatedAt: new Date(),
            },
          });
        } else {
          await prisma.notification.create({
            data: {
              userId: manager.id,
              title: `New message from ${senderName}`,
              message: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
              type: 'MESSAGE',
              metadata: { count: 1, tenantId: targetTenantId },
            },
          });
        }
      }));
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Mark message as read
router.patch('/messages/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = (req as AuthRequest).user!;

    const message = await prisma.communication.findUnique({
      where: { id },
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Authorization check: 
    // If user is tenant, they can only mark OUTBOUND messages as read (sent to them)
    // If user is manager, they can only mark INBOUND messages as read (sent to them)
    // Also check tenant ownership
    if (user.role === 'TENANT') {
      if (message.tenantId !== user.tenantId) return res.status(403).json({ error: 'Access denied' });
      // Tenants read OUTBOUND messages
      // if (message.direction !== 'OUTBOUND') return res.status(400).json({ error: 'Cannot mark own message as read' });
    } else {
      // Managers read INBOUND messages
      // if (message.direction !== 'INBOUND') return res.status(400).json({ error: 'Cannot mark own message as read' });
    }

    const updatedMessage = await prisma.communication.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    res.json(updatedMessage);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

export default router;
