import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import {
    createPayment,
    deletePayment,
    getPaymentById,
    getPayments,
    recordPayment,
    updatePayment,
} from './service';
import {
    createPaymentSchema,
    recordPaymentSchema,
    updatePaymentSchema,
} from './validation';

const router = Router();

// Get all payments with filters
router.get('/', async (req: Request, res: Response) => {
    const filters = {
        leaseId: req.query.leaseId as string | undefined,
        tenantId: req.query.tenantId as string | undefined,
        status: req.query.status as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
    };

    const items = await getPayments(filters);
    res.json({ items });
});

// Get payment by ID
router.get('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const payment = await getPaymentById(id);

    if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
});

// Create new payment
router.post('/', async (req: Request, res: Response) => {
    const parse = createPaymentSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const created = await createPayment(parse.data);
    res.status(201).json(created);
});

// Update payment
router.put('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const parse = updatePaymentSchema.safeParse(req.body);

    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const updated = await updatePayment(id, parse.data);
    res.json(updated);
});

// Record payment (mark as paid)
router.post('/:id/record', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const parse = recordPaymentSchema.safeParse(req.body);

    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const recorded = await recordPayment(id, parse.data);
    res.json(recorded);
});

// Delete payment
router.delete('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    await deletePayment(id);
    res.status(204).send();
});

export default router;
