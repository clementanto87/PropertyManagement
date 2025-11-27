import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        const { limit } = req.query;

        const where: any = {};
        if (user.role === 'TENANT') {
            if (!user.tenantId) return res.status(403).json({ error: 'Tenant ID required' });
            where.tenantId = user.tenantId;
            // Ensure we don't fetch notifications intended for managers
            where.userId = null;
        } else {
            // Manager/Admin
            where.userId = user.id;
            // Ensure we don't fetch notifications intended for tenants
            where.tenantId = null;
        }

        const take = limit ? parseInt(limit as string) : 20;

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take,
        });

        // Count unread
        const unreadCount = await prisma.notification.count({
            where: {
                ...where,
                isRead: false,
            },
        });

        res.json({ items: notifications, unreadCount });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// Mark as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as AuthRequest).user!;

        const notification = await prisma.notification.findUnique({
            where: { id },
        });

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        // Verify ownership
        if (user.role === 'TENANT') {
            if (notification.tenantId !== user.tenantId) return res.status(403).json({ error: 'Access denied' });
        } else {
            if (notification.userId !== user.id) return res.status(403).json({ error: 'Access denied' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });

        res.json(updated);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// Mark all as read
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;

        const where: any = {};
        if (user.role === 'TENANT') {
            if (!user.tenantId) return res.status(403).json({ error: 'Tenant ID required' });
            where.tenantId = user.tenantId;
        } else {
            where.userId = user.id;
        }

        await prisma.notification.updateMany({
            where: {
                ...where,
                isRead: false,
            },
            data: { isRead: true },
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

export default router;
