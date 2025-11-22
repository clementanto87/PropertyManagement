import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from './ui/Button';
import { X, Loader2, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import axios from 'axios';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: () => void;
    onCancel: () => void;
}

function PaymentForm({ clientSecret, amount, onSuccess, onCancel }: PaymentFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required',
            });

            if (error) {
                toast.error(error.message || 'Payment failed');
                setProcessing(false);
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                // Confirm payment with backend
                await axios.post('http://localhost:3000/api/payments/confirm', {
                    paymentIntentId: paymentIntent.id
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('tenant_token')}`
                    }
                });

                toast.success('Payment successful!');
                onSuccess();
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error('Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">Amount to pay:</span>
                    <span className="text-2xl font-bold text-blue-900">${amount.toLocaleString()}</span>
                </div>
            </div>

            <div className="space-y-4">
                <PaymentElement />
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1"
                    disabled={processing}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    className="flex-1"
                    disabled={!stripe || processing}
                >
                    {processing ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay ${amount.toLocaleString()}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

interface PaymentModalProps {
    paymentId: string;
    amount: number;
    dueDate: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ paymentId, amount, dueDate, onClose, onSuccess }: PaymentModalProps) {
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                const response = await axios.post(
                    'http://localhost:3000/api/payments/create-intent',
                    { paymentId },
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('tenant_token')}`
                        }
                    }
                );
                setClientSecret(response.data.clientSecret);
            } catch (error) {
                console.error('Failed to create payment intent:', error);
                toast.error('Failed to initialize payment');
                onClose();
            } finally {
                setLoading(false);
            }
        };

        createPaymentIntent();
    }, [paymentId, onClose]);

    const options = {
        clientSecret: clientSecret || '',
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#2563eb',
            },
        },
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-xl font-bold">Make Payment</h2>
                        <p className="text-sm text-gray-600 mt-1">Due: {new Date(dueDate).toLocaleDateString()}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : clientSecret ? (
                        <Elements stripe={stripePromise} options={options}>
                            <PaymentForm
                                clientSecret={clientSecret}
                                amount={amount}
                                onSuccess={onSuccess}
                                onCancel={onClose}
                            />
                        </Elements>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-red-600">Failed to initialize payment</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
