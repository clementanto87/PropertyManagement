import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as service from './service';
import { createAgreementSchema, sendAgreementSchema, signAgreementSchema } from './validation';
import { logger } from '../../utils/logger';

const router = Router();

// Create new agreement (protected)
router.post('/', authenticate, async (req, res) => {
    try {
        const data = createAgreementSchema.parse(req.body);
        const agreement = await service.createAgreement(data);
        res.status(201).json(agreement);
    } catch (error: any) {
        logger.error('Error creating agreement:', error);
        res.status(400).json({ error: error.message || 'Failed to create agreement' });
    }
});

// List agreements (protected)
router.get('/', authenticate, async (req, res) => {
    try {
        const { leaseId } = req.query;
        const agreements = await service.listAgreements(leaseId as string | undefined);
        res.json(agreements);
    } catch (error: any) {
        logger.error('Error listing agreements:', error);
        res.status(500).json({ error: 'Failed to list agreements' });
    }
});

// Get agreement by ID (public - token-based access)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const agreement = await service.getAgreement(id);

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        res.json(agreement);
    } catch (error: any) {
        logger.error('Error getting agreement:', error);
        res.status(500).json({ error: 'Failed to get agreement' });
    }
});

// Send agreement for signature (protected)
router.post('/:id/send', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { tenantEmail } = req.body;

        if (!tenantEmail) {
            return res.status(400).json({ error: 'Tenant email is required' });
        }

        const agreement = await service.sendForSignature(id, tenantEmail);
        res.json(agreement);
    } catch (error: any) {
        logger.error('Error sending agreement:', error);
        res.status(400).json({ error: error.message || 'Failed to send agreement' });
    }
});

// Sign agreement (public - token-based access)
router.post('/:id/sign', async (req, res) => {
    try {
        const { id } = req.params;
        const data = signAgreementSchema.parse({
            ...req.body,
            agreementId: id,
            ipAddress: req.ip || req.socket.remoteAddress,
        });

        const signature = await service.signAgreement(data);
        res.status(201).json(signature);
    } catch (error: any) {
        logger.error('Error signing agreement:', error);
        res.status(400).json({ error: error.message || 'Failed to sign agreement' });
    }
});

// Void agreement (protected)
router.post('/:id/void', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const agreement = await service.voidAgreement(id);
        res.json(agreement);
    } catch (error: any) {
        logger.error('Error voiding agreement:', error);
        res.status(400).json({ error: error.message || 'Failed to void agreement' });
    }
});

export default router;
