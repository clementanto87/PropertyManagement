import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createDocument, deleteDocument, listDocuments } from './service';
import { createDocumentSchema } from './validation';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    const propertyId = req.query.propertyId as string | undefined;
    const tenantId = req.query.tenantId as string | undefined;
    const leaseId = req.query.leaseId as string | undefined;
    const unitId = req.query.unitId as string | undefined;

    const items = await listDocuments(propertyId, leaseId, tenantId, unitId);
    res.json({ items });
});

import { upload } from '../../middleware/upload';

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        // Parse body fields which come as strings in multipart/form-data
        const body = {
            ...req.body,
            // Ensure these are treated as strings or undefined
            propertyId: req.body.propertyId || undefined,
            tenantId: req.body.tenantId || undefined,
            leaseId: req.body.leaseId || undefined,
            unitId: req.body.unitId || undefined,
        };

        const parse = createDocumentSchema.safeParse(body);
        if (!parse.success) {
            // Clean up uploaded file if validation fails
            // fs.unlinkSync(req.file.path); 
            return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
        }

        const created = await createDocument({
            ...parse.data,
            url: req.file.path, // Store the file path
            type: req.file.mimetype
        });

        res.status(201).json(created);
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        res.status(500).json({ error: 'UploadError', message });
    }
});

// Keep the original metadata-only create endpoint for now, or deprecate it
router.post('/', async (req: Request, res: Response) => {
    const parse = createDocumentSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(400).json({ error: 'ValidationError', issues: parse.error.issues });
    }
    const created = await createDocument(parse.data);
    res.status(201).json(created);
});

router.delete('/:id', async (req: Request, res: Response) => {
    const id = z.string().cuid().parse(req.params.id);
    await deleteDocument(id);
    res.status(204).send();
});

import path from 'path';
import fs from 'fs';
import { prisma } from '../../db/prisma';

router.get('/:id/download', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const document = await prisma.document.findUnique({
            where: { id }
        });

        if (!document || !document.url) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Check if file exists
        // document.url stores the relative path from project root or absolute path?
        // In upload middleware we stored `req.file.path` which is relative like 'uploads/filename'
        const filePath = path.resolve(process.cwd(), document.url);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found on server' });
        }

        res.download(filePath, document.title + path.extname(document.url));
    } catch (err) {
        res.status(500).json({ error: 'Download failed' });
    }
});

export default router;
