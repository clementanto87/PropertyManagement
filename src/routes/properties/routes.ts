import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createProperty, deleteProperty, getProperty, listProperties, updateProperty } from './service';
import { createPropertySchema, updatePropertySchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/types', (req: Request, res: Response) => {
  const types = ['apartment', 'house', 'villa', 'condo', 'townhouse', 'commercial', 'land', 'other'];
  res.json(types);
});

router.get('/', async (req: Request, res: Response) => {
  const { skip, take } = parsePagination(req.query as any);
  const user = (req as any).user;
  const userId = user?.role === 'MANAGER' ? user.id : undefined;
  const caretakerId = user?.role === 'CARETAKER' ? user.caretakerId : undefined;
  const houseOwnerId = user?.role === 'HOUSEOWNER' ? user.houseOwnerId : undefined;

  const includeUnits = req.query.include === 'units' || (req.query.include as string)?.includes('units');
  const items = await listProperties({ skip, take, userId, caretakerId, houseOwnerId, includeUnits });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  // Map frontend 'title' to backend 'name'
  const body = { ...req.body, name: req.body.title || req.body.name };
  const parse = createPropertySchema.safeParse(body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createProperty(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getProperty(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  // Map frontend 'title' to backend 'name'
  const body = { ...req.body, name: req.body.title || req.body.name };
  const parse = updatePropertySchema.safeParse(body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateProperty(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteProperty(id);
  res.status(204).send();
});

export default router;
