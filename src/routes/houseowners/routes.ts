import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createHouseOwner, deleteHouseOwner, getHouseOwner, listHouseOwners, updateHouseOwner } from './service';
import { createHouseOwnerSchema, updateHouseOwnerSchema } from './validation';
import { parsePagination } from '../../utils/query';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const { skip, take } = parsePagination(req.query as any);
    const items = await listHouseOwners({ skip, take });
    res.json({ items, page: Number(req.query.page ?? 1), limit: take });
});

router.post('/', async (req: Request, res: Response) => {
    const parse = createHouseOwnerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }
    const created = await createHouseOwner(parse.data);
    res.status(201).json(created);
});

router.get('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const item = await getHouseOwner(id);
    if (!item) return res.status(404).json({ error: 'NotFound' });
    res.json(item);
});

router.patch('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const parse = updateHouseOwnerSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }
    const updated = await updateHouseOwner(id, parse.data);
    res.json(updated);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    await deleteHouseOwner(id);
    res.status(204).send();
});

export default router;
