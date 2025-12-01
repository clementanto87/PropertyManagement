import Stripe from 'stripe';

// Initialize Stripe with secret key
// Make sure to add STRIPE_SECRET_KEY to your .env file
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
    console.warn('STRIPE_SECRET_KEY is not set. Payment features will not work.');
}

const stripe = new Stripe(stripeKey || 'dummy_key_to_prevent_crash', {
    apiVersion: '2024-11-20.acacia' as any,
});

export default stripe;

// Helper function to create a payment intent
export async function createPaymentIntent(amount: number, metadata: any = {}) {
    return await stripe.paymentIntents.create({
        amount: Math.round(amount), // Amount is already in cents from database
        currency: 'usd',
        metadata,
        automatic_payment_methods: {
            enabled: true,
        },
    });
}

// Helper function to confirm a payment
export async function confirmPayment(paymentIntentId: string) {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
}

// Helper function to create a customer
export async function createCustomer(email: string, name: string) {
    return await stripe.customers.create({
        email,
        name,
    });
}
