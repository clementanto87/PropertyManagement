import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createUser, deleteUser, getUser, listUsers, updateUser, assignPropertiesToUser } from './service';
import { createUserSchema, updateUserSchema, assignPropertiesSchema } from './validation';
import { authenticate, authorize } from '../../middleware/auth';

const router = Router();

// Protect all routes
router.use(authenticate);
router.use(authorize(['ADMIN', 'MANAGER']));

router.get('/', async (req: Request, res: Response) => {
    const users = await listUsers();
    res.json(users);
});

router.post('/', async (req: Request, res: Response) => {
    const parse = createUserSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const currentUser = (req as any).user;
    const newRole = parse.data.role;

    // RBAC Checks
    if (currentUser.role === 'MANAGER') {
        if (newRole === 'ADMIN') {
            return res.status(403).json({ error: 'Managers cannot create Admins' });
        }
    }

    try {
        const created = await createUser(parse.data);
        const { password, ...userWithoutPassword } = created;
        res.status(201).json(userWithoutPassword);
    } catch (e: any) {
        if (e.code === 'P2002') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        throw e;
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const user = await getUser(id);
    if (!user) return res.status(404).json({ error: 'NotFound' });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
});

router.patch('/:id/properties', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const parse = assignPropertiesSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const updated = await assignPropertiesToUser(id, parse.data.propertyIds, parse.data.unitIds);
    const { password, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
});

router.patch('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const parse = updateUserSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }

    const currentUser = (req as any).user;
    const targetUser = await getUser(id);

    if (!targetUser) return res.status(404).json({ error: 'NotFound' });

    // RBAC Checks
    if (currentUser.role === 'MANAGER') {
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ error: 'Managers cannot update Admins' });
        }
        if (parse.data.role === 'ADMIN') {
            return res.status(403).json({ error: 'Managers cannot promote to Admin' });
        }
    }

    const updated = await updateUser(id, parse.data);
    const { password, ...userWithoutPassword } = updated;
    res.json(userWithoutPassword);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    const currentUser = (req as any).user;
    const targetUser = await getUser(id);

    if (!targetUser) return res.status(404).json({ error: 'NotFound' });

    // RBAC Checks
    if (currentUser.role === 'MANAGER') {
        if (targetUser.role === 'ADMIN') {
            return res.status(403).json({ error: 'Managers cannot delete Admins' });
        }
    }

    await deleteUser(id);
    res.status(204).send();
});

export default router;
