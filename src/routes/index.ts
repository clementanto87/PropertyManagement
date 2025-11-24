import { Router, type Request, type Response } from 'express';
import { prisma } from '../db/prisma';
import authRouter from './auth/routes';
import propertiesRouter from './properties/routes';
import unitsRouter from './units/routes';
import tenantsRouter from './tenants/routes';
import leasesRouter from './leases/routes';
import leaseAgreementsRouter from './lease-agreements/routes';
import tenantInvitationsRouter from './tenant-invitations/routes';
import workOrdersRouter from './work-orders/routes';
import vendorsRouter from './vendors/routes';
import expensesRouter from './expenses/routes';
import communicationsRouter from './communications';
import dashboardRouter from './dashboard';
import documentsRouter from './documents/routes';
import paymentsRouter from './payments/routes';
import calendarRouter from './calendar/routes';
import pdfRouter from './pdf/routes';
import emailTemplatesRouter from './email-templates/routes';
import gdprRouter from './gdpr/routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

router.get('/db/health', async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: 'ok' });
  } catch (err) {
    res.status(500).json({ db: 'down' });
  }
});

router.use('/auth', authRouter);
router.use('/properties', propertiesRouter);
router.use('/units', unitsRouter);
router.use('/tenants', tenantsRouter);
router.use('/leases', leasesRouter);
router.use('/lease-agreements', leaseAgreementsRouter);
router.use('/tenant-invitations', tenantInvitationsRouter);
router.use('/work-orders', workOrdersRouter);
router.use('/vendors', vendorsRouter);
router.use('/expenses', expensesRouter);
router.use('/communications', communicationsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/documents', documentsRouter);
router.use('/payments', paymentsRouter);
router.use('/calendar', calendarRouter);
router.use('/pdf', pdfRouter);
router.use('/email-templates', emailTemplatesRouter);
router.use('/gdpr', gdprRouter);

export default router;
