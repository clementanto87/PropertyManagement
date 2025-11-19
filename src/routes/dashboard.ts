import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        // 1. Occupancy Rate
        const totalUnits = await prisma.unit.count();
        const occupiedUnits = await prisma.unit.count({
            where: { status: 'OCCUPIED' }
        });
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        // 2. Rent Collected (Current Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const payments = await prisma.payment.findMany({
            where: {
                status: 'PAID',
                paidAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });
        const rentCollected = payments.reduce((sum, p) => sum + p.amount, 0);

        // 3. Rent Overdue
        const overduePayments = await prisma.payment.findMany({
            where: { status: 'OVERDUE' }
        });
        const rentOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

        // 4. Open Requests
        const openRequests = await prisma.workOrder.count({
            where: {
                status: {
                    not: 'COMPLETED'
                }
            }
        });

        // 5. Total Counts
        const totalProperties = await prisma.property.count();
        const totalTenants = await prisma.tenant.count();

        // 6. Recent Activity (Last 5 Work Orders)
        const recentWorkOrders = await prisma.workOrder.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                unit: true
            }
        });

        res.json({
            occupancyRate,
            occupancyChange: 2, // Placeholder for trend
            rentCollected,
            rentCollectedChange: 5, // Placeholder for trend
            rentOverdue,
            rentOverdueChange: -10, // Placeholder for trend
            openRequests,
            openRequestsChange: 0, // Placeholder for trend
            totalProperties,
            totalTenants,
            recentWorkOrders
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
