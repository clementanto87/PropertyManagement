import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import * as service from './service';
import { createInvitationSchema, validateTokenSchema, acceptInvitationSchema } from './validation';
import { logger } from '../../utils/logger';

const router = Router();

// Create invitation (protected)
router.post('/', authenticate, async (req, res) => {
    try {
        const data = createInvitationSchema.parse(req.body);
        const invitation = await service.createInvitation(data);

        // Don't send token in response for security
        const { token, ...invitationData } = invitation;
        res.status(201).json(invitationData);
    } catch (error: any) {
        logger.error('Error creating invitation:', error);
        res.status(400).json({ error: error.message || 'Failed to create invitation' });
    }
});

// List invitations (protected)
router.get('/', authenticate, async (req, res) => {
    try {
        const { tenantId } = req.query;
        const invitations = await service.listInvitations(tenantId as string | undefined);

        // Remove tokens from response
        const sanitizedInvitations = invitations.map(({ token, ...inv }: any) => inv);
        res.json(sanitizedInvitations);
    } catch (error: any) {
        logger.error('Error listing invitations:', error);
        res.status(500).json({ error: 'Failed to list invitations' });
    }
});

// Validate token (public)
router.get('/validate/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const invitation = await service.validateToken(token);

        // Return minimal info for validation
        res.json({
            valid: true,
            tenantName: invitation.tenant.name,
            email: invitation.email,
            expiresAt: invitation.expiresAt,
        });
    } catch (error: any) {
        logger.error('Error validating token:', error);
        res.status(400).json({ valid: false, error: error.message });
    }
});

// Accept invitation (public)
router.post('/accept', async (req, res) => {
    try {
        const data = acceptInvitationSchema.parse(req.body);
        const result = await service.acceptInvitation(data);

        // Return success without sensitive data
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            email: result.user.email,
            token: result.token,
            user: {
                id: result.user.id,
                name: result.user.name,
                email: result.user.email,
                role: result.user.role,
            }
        });
    } catch (error: any) {
        logger.error('Error accepting invitation:', error);
        res.status(400).json({ error: error.message || 'Failed to accept invitation' });
    }
});

export default router;
