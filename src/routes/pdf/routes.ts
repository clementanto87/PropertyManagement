import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { prisma } from '../../db/prisma';
import { generateLeaseAgreementPDF } from '../../services/pdf/pdfGenerator';
import { logger } from '../../utils/logger';

const router = Router();

// Generate PDF for a lease agreement
router.get('/lease-agreement/:agreementId', authenticate, async (req, res) => {
    try {
        const { agreementId } = req.params;

        const agreement = await prisma.leaseAgreement.findUnique({
            where: { id: agreementId },
            include: {
                lease: {
                    include: {
                        tenant: true,
                        unit: {
                            include: {
                                property: true,
                            },
                        },
                    },
                },
                signatures: true,
            },
        });

        if (!agreement) {
            return res.status(404).json({ error: 'Agreement not found' });
        }

        const pdfBuffer = await generateLeaseAgreementPDF({
            lease: agreement.lease,
            signatures: agreement.signatures,
            agreementContent: agreement.templateContent,
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="lease-agreement-${agreementId}.pdf"`
        );
        res.send(pdfBuffer);
    } catch (error: any) {
        logger.error({ error }, 'Error generating PDF');
        res.status(500).json({ error: 'Failed to generate PDF' });
    }
});

// Preview PDF for a lease (without agreement)
router.get('/lease/:leaseId/preview', authenticate, async (req, res) => {
    try {
        const { leaseId } = req.params;

        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: {
                tenant: true,
                unit: {
                    include: {
                        property: true,
                    },
                },
            },
        });

        if (!lease) {
            return res.status(404).json({ error: 'Lease not found' });
        }

        const pdfBuffer = await generateLeaseAgreementPDF({
            lease,
            signatures: [],
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="lease-preview-${leaseId}.pdf"`
        );
        res.send(pdfBuffer);
    } catch (error: any) {
        logger.error({ error }, 'Error generating PDF preview');
        res.status(500).json({ error: 'Failed to generate PDF preview' });
    }
});

export default router;
