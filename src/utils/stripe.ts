import Stripe from 'stripe';

// Initialize Stripe with secret key
// Make sure to add STRIPE_SECRET_KEY to your .env file
// Get your keys from: https://dashboard.stripe.com/test/apikeys
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-11-20.acacia' as any, // Type assertion for newer API version
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
