import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
    try {
        const { propertyId } = req.query;
        const propertyFilter = propertyId ? { id: String(propertyId) } : {};
        const unitFilter = propertyId ? { propertyId: String(propertyId) } : {};
        const leaseFilter = propertyId ? { unit: { propertyId: String(propertyId) } } : {};
        const paymentFilter = propertyId ? { lease: { unit: { propertyId: String(propertyId) } } } : {};
        const workOrderFilter = propertyId ? { unit: { propertyId: String(propertyId) } } : {};
        // For tenants, we count tenants who have at least one lease in the filtered property
        const tenantFilter = propertyId ? { leases: { some: { unit: { propertyId: String(propertyId) } } } } : {};

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Occupancy Rate & Trend
        const totalUnits = await prisma.unit.count({ where: unitFilter });
        const occupiedUnits = await prisma.unit.count({
            where: { ...unitFilter, status: 'OCCUPIED' }
        });
        const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

        // Calculate previous month occupancy (Approximation based on active leases last month)
        const activeLeasesLastMonth = await prisma.lease.count({
            where: {
                ...leaseFilter,
                startDate: { lte: endOfLastMonth },
                endDate: { gte: endOfLastMonth },
                status: { not: 'TERMINATED' }
            }
        });
        const prevOccupancyRate = totalUnits > 0 ? Math.round((activeLeasesLastMonth / totalUnits) * 100) : 0;
        const occupancyChange = occupancyRate - prevOccupancyRate;

        // 2. Rent Collected (Current Month vs Last Month)
        const paymentsCurrentMonth = await prisma.payment.findMany({
            where: {
                ...paymentFilter,
                status: 'PAID',
                paidAt: {
                    gte: startOfMonth,
                    lte: endOfMonth
                }
            }
        });
        const rentCollected = paymentsCurrentMonth.reduce((sum, p) => sum + p.amount, 0);

        const paymentsLastMonth = await prisma.payment.findMany({
            where: {
                ...paymentFilter,
                status: 'PAID',
                paidAt: {
                    gte: startOfLastMonth,
                    lte: endOfLastMonth
                }
            }
        });
        const rentCollectedLastMonth = paymentsLastMonth.reduce((sum, p) => sum + p.amount, 0);
        const rentCollectedChange = rentCollectedLastMonth > 0
            ? Math.round(((rentCollected - rentCollectedLastMonth) / rentCollectedLastMonth) * 100)
            : 0;

        // 3. Rent Overdue
        const overduePayments = await prisma.payment.findMany({
            where: { ...paymentFilter, status: 'OVERDUE' }
        });
        const rentOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

        const overdueThisMonth = await prisma.payment.findMany({
            where: {
                ...paymentFilter,
                status: 'OVERDUE',
                dueDate: { gte: startOfMonth, lte: endOfMonth }
            }
        });
        const overdueLastMonth = await prisma.payment.findMany({
            where: {
                ...paymentFilter,
                status: 'OVERDUE',
                dueDate: { gte: startOfLastMonth, lte: endOfLastMonth }
            }
        });
        const amountOverdueThisMonth = overdueThisMonth.reduce((sum, p) => sum + p.amount, 0);
        const amountOverdueLastMonth = overdueLastMonth.reduce((sum, p) => sum + p.amount, 0);
        const rentOverdueChange = amountOverdueLastMonth > 0
            ? Math.round(((amountOverdueThisMonth - amountOverdueLastMonth) / amountOverdueLastMonth) * 100)
            : 0;

        // 4. Open Requests & Resolved This Week
        const openRequests = await prisma.workOrder.count({
            where: {
                ...workOrderFilter,
                status: { not: 'COMPLETED' }
            }
        });

        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const resolvedThisWeek = await prisma.workOrder.count({
            where: {
                ...workOrderFilter,
                status: 'COMPLETED',
                updatedAt: { gte: oneWeekAgo }
            }
        });

        // 5. Total Counts
        const totalProperties = await prisma.property.count({ where: propertyFilter });
        const totalTenants = await prisma.tenant.count({ where: tenantFilter });

        // 6. Recent Activity (Last 5 Work Orders)
        const recentWorkOrders = await prisma.workOrder.findMany({
            where: workOrderFilter,
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                unit: true,
                vendor: true
            }
        });

        // 7. Expiring Leases (Next 30 days)
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const expiringLeases = await prisma.lease.findMany({
            where: {
                ...leaseFilter,
                endDate: {
                    gte: now,
                    lte: thirtyDaysFromNow
                },
                status: 'ACTIVE'
            },
            include: {
                tenant: true,
                unit: {
                    include: {
                        property: true
                    }
                }
            },
            take: 5,
            orderBy: { endDate: 'asc' }
        });

        // 8. Properties for Map
        const properties = await prisma.property.findMany({
            where: propertyFilter,
            include: {
                units: {
                    select: {
                        status: true,
                        workOrders: {
                            where: {
                                status: { not: 'COMPLETED' }
                            }
                        }
                    }
                }
            }
        });

        // Map properties to include occupancy status and mock coordinates if missing
        const mapProperties = properties.map((prop, index) => {
            const totalUnits = prop.units.length;
            const occupiedUnits = prop.units.filter(u => u.status === 'OCCUPIED').length;
            const occupancyStatus = totalUnits === 0 ? 'VACANT' : (occupiedUnits === totalUnits ? 'OCCUPIED' : 'PARTIAL');

            // Mock coordinates around New York if missing (just for demo)
            // Base: 40.7128° N, 74.0060° W
            const lat = prop.latitude || (40.7128 + (Math.random() - 0.5) * 0.1);
            const lng = prop.longitude || (-74.0060 + (Math.random() - 0.5) * 0.1);

            const vacantUnits = totalUnits - occupiedUnits;
            const maintenanceCount = prop.units.reduce((sum, u) => sum + u.workOrders.length, 0);

            return {
                id: prop.id,
                name: prop.name,
                address: prop.address,
                latitude: lat,
                longitude: lng,
                status: occupancyStatus,
                occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
                image: prop.image,
                totalUnits,
                occupiedUnits,
                vacantUnits,
                maintenanceCount
            };
        });

        res.json({
            occupancyRate,
            occupancyChange,
            rentCollected,
            rentCollectedChange,
            rentOverdue,
            rentOverdueChange,
            openRequests,
            openRequestsChange: resolvedThisWeek,
            totalProperties,
            totalUnits,
            totalTenants,
            recentWorkOrders: recentWorkOrders.map(wo => ({
                ...wo,
                priority: (wo.title.toLowerCase().includes('urgent') || wo.title.toLowerCase().includes('leak') || wo.title.toLowerCase().includes('emergency'))
                    ? 'URGENT'
                    : (wo.title.toLowerCase().includes('broken') ? 'HIGH' : 'MEDIUM')
            })),
            expiringLeases: expiringLeases.map(lease => ({
                id: lease.id,
                tenantName: lease.tenant.name,
                unitNumber: lease.unit.unitNumber,
                daysUntilExpiry: Math.ceil((new Date(lease.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
                rentAmount: lease.rentAmount,
                leaseEnd: lease.endDate,
                propertyName: lease.unit.property.name,
                tenantEmail: lease.tenant.email,
                tenantPhone: lease.tenant.phone
            })),
            properties: mapProperties
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});

export default router;
