import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createExpense, deleteExpense, getExpense, listExpenses, updateExpense } from './service';
import { createExpenseSchema, updateExpenseSchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const propertyId = req.query.propertyId ? z.string().cuid().parse(req.query.propertyId) : undefined;
  const { skip, take } = parsePagination(req.query as any);

  const user = (req as any).user;
  const userId = user?.role === 'MANAGER' ? user.id : undefined;

  const items = await listExpenses(propertyId, { skip, take, userId });
  res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
  const parse = createExpenseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const created = await createExpense(parse.data);
  res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const item = await getExpense(id);
  if (!item) return res.status(404).json({ error: 'NotFound' });
  res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  const parse = updateExpenseSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
  }
  const updated = await updateExpense(id, parse.data);
  res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const id = z.string().cuid().parse(req.params.id);
  await deleteExpense(id);
  res.status(204).send();
});

export default router;
