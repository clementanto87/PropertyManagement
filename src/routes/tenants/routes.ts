import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createTenant, deleteTenant, getTenant, listTenants, updateTenant } from './service';
import { createTenantSchema, updateTenantSchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { skip, take } = parsePagination(req.query as any);

  const user = (req as any).user;
  const userId = user?.role === 'MANAGER' ? user.id : undefined;

  const items = await listTenants({ skip, take, userId });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  const parse = createTenantSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createTenant(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getTenant(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const parse = updateTenantSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateTenant(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteTenant(id);
  res.status(204).send();
});

export default router;
