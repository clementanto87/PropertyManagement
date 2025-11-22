import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { getCalendarEvents } from './service';

const router = Router();

// Get calendar events
router.get('/events', async (req: Request, res: Response) => {
    try {
        const startDate = z.string().parse(req.query.startDate);
        const endDate = z.string().parse(req.query.endDate);
        const types = req.query.types
            ? (Array.isArray(req.query.types) ? req.query.types : [req.query.types]) as string[]
            : undefined;

        const events = await getCalendarEvents({ startDate, endDate, types });
        res.json({ items: events });
    } catch (error) {
        console.error('Error fetching calendar events:', error);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
});

export default router;
