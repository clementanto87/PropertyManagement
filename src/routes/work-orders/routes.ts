import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createWorkOrder, deleteWorkOrder, getWorkOrder, listWorkOrders, updateWorkOrder } from './service';
import { createWorkOrderSchema, updateWorkOrderSchema, workOrderStatusEnum } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const unitId = req.query.unitId ? z.string().cuid().parse(req.query.unitId) : undefined;
  const status = req.query.status ? workOrderStatusEnum.parse(req.query.status) : undefined;
  const { skip, take } = parsePagination(req.query as any);
  const items = await listWorkOrders(unitId, status, { skip, take });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  const parse = createWorkOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createWorkOrder(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getWorkOrder(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const parse = updateWorkOrderSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateWorkOrder(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteWorkOrder(id);
  res.status(204).send();
});

export default router;
