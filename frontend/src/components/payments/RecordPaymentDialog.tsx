import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select-component';
import Textarea from '@/components/ui/textarea';
import { paymentService, Payment } from '@/api/paymentService';
import { toast } from 'sonner';
import { format } from 'date-fns';

const recordSchema = z.object({
    paidAt: z.string().min(1, 'Payment date is required'),
    paymentMethod: z.enum(['CASH', 'CHECK', 'BANK_TRANSFER', 'CREDIT_CARD', 'OTHER']),
    notes: z.string().optional(),
});

type RecordFormValues = z.infer<typeof recordSchema>;

type RecordPaymentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment: Payment | null;
    onPaymentRecorded: () => void;
};

export function RecordPaymentDialog({
    open,
    onOpenChange,
    payment,
    onPaymentRecorded,
}: RecordPaymentDialogProps) {
    const [isRecording, setIsRecording] = useState(false);

    const form = useForm<RecordFormValues>({
        resolver: zodResolver(recordSchema),
        defaultValues: {
            paidAt: format(new Date(), 'yyyy-MM-dd'),
            paymentMethod: 'CASH',
            notes: '',
        },
    });

    const onSubmit = async (data: RecordFormValues) => {
        if (!payment) return;

        setIsRecording(true);
        try {
            await paymentService.recordPayment(payment.id, {
                paidAt: new Date(data.paidAt).toISOString(),
                paymentMethod: data.paymentMethod,
                notes: data.notes,
            });

            toast.success('Payment recorded successfully');
            form.reset();
            onOpenChange(false);
            onPaymentRecorded();
        } catch (error) {
            console.error('Error recording payment:', error);
            toast.error('Failed to record payment');
        } finally {
            setIsRecording(false);
        }
    };

    if (!payment) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Mark this payment as received and generate a receipt.
                    </DialogDescription>
                </DialogHeader>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Tenant:</span>
                        <span className="font-medium">{payment.lease?.tenant.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Amount:</span>
                        <span className="font-semibold text-lg flex items-center">
                            <DollarSign className="h-4 w-4" />
                            {(payment.amount / 100).toFixed(2)}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Due Date:</span>
                        <span className="font-medium">{format(new Date(payment.dueDate), 'MMM dd, yyyy')}</span>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="paidAt"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentMethod"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select payment method" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash</SelectItem>
                                            <SelectItem value="CHECK">Check</SelectItem>
                                            <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., Check #1234, Transaction ID, etc."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isRecording}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isRecording}>
                                {isRecording && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Record Payment
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
