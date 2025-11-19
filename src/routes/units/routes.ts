import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createUnit, deleteUnit, getUnit, listUnits, updateUnit } from './service';
import { createUnitSchema, updateUnitSchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const propertyId = req.query.propertyId ? z.string().cuid().parse(req.query.propertyId) : undefined;
  const { skip, take } = parsePagination(req.query as any);
  const items = await listUnits(propertyId, { skip, take });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  const parse = createUnitSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createUnit(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getUnit(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const parse = updateUnitSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateUnit(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteUnit(id);
  res.status(204).send();
});

export default router;
