import { Router, type Request, type Response } from 'express';
import { prisma } from '../../db/prisma';
import { authenticate } from '../../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Helper to get tenant ID from request
const getTenantId = (req: Request) => {
    const user = (req as any).user;
    if (!user || user.role !== 'TENANT' || !user.tenantId) {
        throw new Error('Unauthorized');
    }
    return user.tenantId;
};

// Dashboard Data
router.get('/dashboard', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);

        const [tenant, activeLease, openRequests] = await Promise.all([
            prisma.tenant.findUnique({ where: { id: tenantId } }),
            prisma.lease.findFirst({
                where: { tenantId, status: 'ACTIVE' },
                include: { unit: true }
            }),
            prisma.workOrder.count({
                where: {
                    unit: { leases: { some: { tenantId, status: 'ACTIVE' } } },
                    status: { not: 'COMPLETED' }
                }
            })
        ]);

        // Fetch recent activity (payments and maintenance)
        const [recentPayments, recentMaintenance] = await Promise.all([
            prisma.payment.findMany({
                where: { lease: { tenantId } },
                orderBy: { createdAt: 'desc' },
                take: 3
            }),
            prisma.workOrder.findMany({
                where: { unit: { leases: { some: { tenantId, status: 'ACTIVE' } } } },
                orderBy: { createdAt: 'desc' },
                take: 3
            })
        ]);

        const recentActivity = [
            ...recentPayments.map(p => ({
                id: p.id,
                type: 'payment',
                title: `Rent Payment`,
                date: p.createdAt.toLocaleDateString(),
                amount: p.amount,
                status: p.status.toLowerCase()
            })),
            ...recentMaintenance.map(m => ({
                id: m.id,
                type: 'maintenance',
                title: m.title,
                date: m.createdAt.toLocaleDateString(),
                amount: 0,
                status: m.status.toLowerCase()
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

        // Calculate balance (mock for now, or sum unpaid payments)
        const balance = 1200; // Replace with real calculation

        res.json({
            tenantName: tenant?.name,
            balance,
            nextDueDate: 'Oct 1, 2023', // Replace with real date
            leaseStatus: activeLease ? 'Active' : 'Inactive',
            leaseEndDate: activeLease?.endDate,
            openRequests,
            recentActivity
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Payments
router.get('/payments', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const payments = await prisma.payment.findMany({
            where: { lease: { tenantId } },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        res.json(payments);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

// Maintenance
router.get('/maintenance', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        // Find unit ID from active lease
        const lease = await prisma.lease.findFirst({
            where: { tenantId, status: 'ACTIVE' }
        });

        if (!lease) {
            return res.json([]);
        }

        const requests = await prisma.workOrder.findMany({
            where: { unitId: lease.unitId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch maintenance requests' });
    }
});

router.post('/maintenance', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { title, description, priority } = req.body;

        const lease = await prisma.lease.findFirst({
            where: { tenantId, status: 'ACTIVE' }
        });

        if (!lease) {
            return res.status(400).json({ error: 'No active lease found' });
        }

        const workOrder = await prisma.workOrder.create({
            data: {
                unitId: lease.unitId,
                title,
                description,
                status: 'NEW',
                // priority // Add priority to schema if needed
            }
        });

        res.json(workOrder);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create maintenance request' });
    }
});

// Documents
router.get('/documents', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    { lease: { tenantId } },
                    { unit: { leases: { some: { tenantId } } } } // Property docs
                ]
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(documents);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// Community Feed
router.get('/community', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const posts = await prisma.post.findMany({
            orderBy: { createdAt: 'desc' },
            include: { author: { select: { name: true } } }
        });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch community posts' });
    }
});

router.post('/community', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const user = (req as any).user;
        const { title, content, category } = req.body;

        const post = await prisma.post.create({
            data: {
                title,
                content,
                category,
                authorId: user.userId
            },
            include: { author: { select: { name: true } } }
        });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// Amenities
router.get('/amenities', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        // For now, fetch all amenities. In future, filter by property.
        const amenities = await prisma.amenity.findMany();
        res.json(amenities);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch amenities' });
    }
});

router.get('/amenities/bookings', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const user = (req as any).user;

        const bookings = await prisma.amenityBooking.findMany({
            where: { userId: user.userId },
            include: { amenity: true },
            orderBy: { startTime: 'desc' }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

router.post('/amenities/book', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const user = (req as any).user;
        const { amenityId, startTime, endTime } = req.body;

        const booking = await prisma.amenityBooking.create({
            data: {
                amenityId,
                userId: user.userId,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                status: 'CONFIRMED' // Auto-confirm for now
            },
            include: { amenity: true }
        });
        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

// Profile
router.get('/profile', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const userId = (req as any).user?.userId || (req as any).user?.id;

        // Fetch tenant data
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emergencyContact: true
            }
        });

        if (!tenant) {
            return res.status(404).json({ error: 'Tenant not found' });
        }

        // Try to fetch user email if userId exists
        let userEmail = tenant.email;
        if (userId) {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { email: true }
            });
            if (user) {
                userEmail = user.email;
            }
        }

        res.json({
            ...tenant,
            userEmail
        });
    } catch (err) {
        console.error('Profile endpoint error:', err);
        res.status(500).json({ error: 'Failed to fetch profile', details: err instanceof Error ? err.message : 'Unknown error' });
    }
});

router.put('/profile', async (req: Request, res: Response) => {
    try {
        const tenantId = getTenantId(req);
        const { name, phone, emergencyContact } = req.body;

        const updatedTenant = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name,
                phone,
                emergencyContact
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                emergencyContact: true
            }
        });

        res.json(updatedTenant);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

export default router;
