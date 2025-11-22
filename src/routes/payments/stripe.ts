import { Router, type Request, type Response } from 'express';
import { prisma } from '../../db/prisma';
import { authenticate } from '../../middleware/auth';
import stripe, { createPaymentIntent, confirmPayment } from '../../utils/stripe';

const router = Router();

// Apply auth middleware to all routes except webhook
router.post('/webhook', async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;

    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                console.log('Payment succeeded:', paymentIntent.id);
                // Update payment status in database
                await prisma.payment.updateMany({
                    where: { stripePaymentIntentId: paymentIntent.id },
                    data: { status: 'PAID' }
                });
                break;
            case 'payment_intent.payment_failed':
                const failedIntent = event.data.object;
                console.log('Payment failed:', failedIntent.id);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (err) {
        console.error('Webhook error:', err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
});

// All other routes require authentication
router.use(authenticate);

// Create payment intent
router.post('/create-intent', async (req: Request, res: Response) => {
    try {
        const { paymentId } = req.body;
        const user = (req as any).user;

        // Get payment details
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                lease: {
                    include: {
                        tenant: true
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Verify this payment belongs to the authenticated tenant
        if (payment.lease.tenant.id !== user.tenantId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Check if payment is already paid
        if (payment.status === 'PAID') {
            return res.status(400).json({ error: 'Payment already completed' });
        }

        // Create Stripe payment intent
        const paymentIntent = await createPaymentIntent(payment.amount, {
            paymentId: payment.id,
            tenantId: payment.lease.tenant.id,
            tenantName: payment.lease.tenant.name,
        });

        // Store the payment intent ID
        await prisma.payment.update({
            where: { id: paymentId },
            data: { stripePaymentIntentId: paymentIntent.id }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            amount: payment.amount
        });
    } catch (err) {
        console.error('Create intent error:', err);
        console.error('Error details:', {
            message: err instanceof Error ? err.message : 'Unknown error',
            stack: err instanceof Error ? err.stack : undefined,
            paymentId: req.body.paymentId
        });
        res.status(500).json({
            error: 'Failed to create payment intent',
            details: err instanceof Error ? err.message : 'Unknown error'
        });
    }
});

// Confirm payment
router.post('/confirm', async (req: Request, res: Response) => {
    try {
        const { paymentIntentId } = req.body;
        const user = (req as any).user;

        // Retrieve payment intent from Stripe
        const paymentIntent = await confirmPayment(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ error: 'Payment not successful' });
        }

        // Find the payment in our database
        const payment = await prisma.payment.findFirst({
            where: { stripePaymentIntentId: paymentIntentId },
            include: {
                lease: {
                    include: {
                        tenant: true
                    }
                }
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Verify this payment belongs to the authenticated tenant
        if (payment.lease.tenant.id !== user.tenantId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Update payment status
        const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
                status: 'PAID',
                paymentMethod: paymentIntent.payment_method_types[0] || 'card',
                paidAt: new Date()
            }
        });

        res.json({
            success: true,
            payment: updatedPayment,
            receiptUrl: paymentIntent.charges.data[0]?.receipt_url
        });
    } catch (err) {
        console.error('Confirm payment error:', err);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
});

export default router;
