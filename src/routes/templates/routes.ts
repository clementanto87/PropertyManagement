import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import {
    getTemplates,
    getTemplateById,
    createTemplate,
    updateTemplate,
    deleteTemplate,
} from './service';
import { createTemplateSchema, updateTemplateSchema } from './validation';

const router = Router();

// Get all templates
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { type, category, isActive } = req.query;
        const filters: any = {};

        if (type) {
            filters.type = type as 'EMAIL' | 'AGREEMENT' | 'INVOICE';
        }

        if (category) {
            filters.category = category as string;
        }

        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        const templates = await getTemplates(filters);
        res.json({ items: templates });
    } catch (error) {
        console.error('Error fetching templates:', error);
        res.status(500).json({ error: 'Failed to fetch templates' });
    }
});

// Get template by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        const template = await getTemplateById(id);

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching template:', error);
        res.status(500).json({ error: 'Failed to fetch template' });
    }
});

// Create template
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const parse = createTemplateSchema.safeParse(req.body);

        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const template = await createTemplate(parse.data);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating template:', error);
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Update template
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        const parse = updateTemplateSchema.safeParse(req.body);

        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const template = await updateTemplate(id, parse.data);
        res.json(template);
    } catch (error) {
        console.error('Error updating template:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete template
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        await deleteTemplate(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting template:', error);
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

export default router;
