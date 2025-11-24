import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/auth';
import {
    getEmailTemplates,
    getEmailTemplateById,
    createEmailTemplate,
    updateEmailTemplate,
    deleteEmailTemplate,
} from './service';
import { createEmailTemplateSchema, updateEmailTemplateSchema } from './validation';

const router = Router();

// Get all email templates
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const { category, isActive } = req.query;
        const filters: any = {};

        if (category) {
            filters.category = category as string;
        }

        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }

        const templates = await getEmailTemplates(filters);
        res.json({ items: templates });
    } catch (error) {
        console.error('Error fetching email templates:', error);
        res.status(500).json({ error: 'Failed to fetch email templates' });
    }
});

// Get email template by ID
router.get('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        const template = await getEmailTemplateById(id);

        if (!template) {
            return res.status(404).json({ error: 'Email template not found' });
        }

        res.json(template);
    } catch (error) {
        console.error('Error fetching email template:', error);
        res.status(500).json({ error: 'Failed to fetch email template' });
    }
});

// Create email template
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const parse = createEmailTemplateSchema.safeParse(req.body);

        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const template = await createEmailTemplate(parse.data);
        res.status(201).json(template);
    } catch (error) {
        console.error('Error creating email template:', error);
        res.status(500).json({ error: 'Failed to create email template' });
    }
});

// Update email template
router.put('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        const parse = updateEmailTemplateSchema.safeParse(req.body);

        if (!parse.success) {
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const template = await updateEmailTemplate(id, parse.data);
        res.json(template);
    } catch (error) {
        console.error('Error updating email template:', error);
        res.status(500).json({ error: 'Failed to update email template' });
    }
});

// Delete email template
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const id = z.string().cuid().parse(req.params.id);
        await deleteEmailTemplate(id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting email template:', error);
        res.status(500).json({ error: 'Failed to delete email template' });
    }
});

export default router;
