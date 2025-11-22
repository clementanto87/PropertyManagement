import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createLease, deleteLease, getLease, listLeases, updateLease } from './service';
import { createLeaseSchema, updateLeaseSchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const unitId = req.query.unitId && typeof req.query.unitId === 'string'
    ? z.string().cuid().safeParse(req.query.unitId).success ? req.query.unitId : undefined
    : undefined;
  const tenantId = req.query.tenantId && typeof req.query.tenantId === 'string'
    ? z.string().cuid().safeParse(req.query.tenantId).success ? req.query.tenantId : undefined
    : undefined;
  const { skip, take } = parsePagination(req.query as any);
  const items = await listLeases(unitId, tenantId, { skip, take });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  const parse = createLeaseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createLease(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getLease(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const parse = updateLeaseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateLease(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteLease(id);
  res.status(204).send();
});

export default router;
