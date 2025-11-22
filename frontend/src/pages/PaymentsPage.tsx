import { useEffect, useState } from 'react';
import { DollarSign, Calendar, Filter, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select-component';
import { paymentService, Payment } from '@/api/paymentService';
import { RecordPaymentDialog } from '@/components/payments/RecordPaymentDialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [showRecordDialog, setShowRecordDialog] = useState(false);

    useEffect(() => {
        loadPayments();
    }, [statusFilter]);

    const loadPayments = async () => {
        try {
            const filters = statusFilter !== 'all' ? { status: statusFilter } : {};
            const data = await paymentService.getPayments(filters);
            setPayments(data);
        } catch (error) {
            console.error('Failed to load payments:', error);
            toast.error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowRecordDialog(true);
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PAID: 'bg-green-100 text-green-700',
            PENDING: 'bg-yellow-100 text-yellow-700',
            OVERDUE: 'bg-red-100 text-red-700',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading payments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Payments</h1>
                            <p className="text-sm text-gray-500">Manage rent payments and receipts</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="PAID">Paid</SelectItem>
                                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 py-6 max-w-7xl mx-auto">
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tenant</TableHead>
                                <TableHead>Property</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Receipt #</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">No payments found</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-medium">
                                            {payment.lease?.tenant.name}
                                        </TableCell>
                                        <TableCell>
                                            {payment.lease?.unit?.property?.name || 'N/A'}
                                        </TableCell>
                                        <TableCell className="font-semibold">
                                            ${(payment.amount / 100).toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                {payment.status}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {payment.receiptNumber || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {payment.status === 'PENDING' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleRecordPayment(payment)}
                                                    className="gap-2"
                                                >
                                                    <DollarSign className="h-4 w-4" />
                                                    Record Payment
                                                </Button>
                                            )}
                                            {payment.status === 'PAID' && payment.paidAt && (
                                                <span className="text-sm text-gray-500">
                                                    Paid {format(new Date(payment.paidAt), 'MMM dd')}
                                                </span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* Record Payment Dialog */}
            <RecordPaymentDialog
                open={showRecordDialog}
                onOpenChange={setShowRecordDialog}
                payment={selectedPayment}
                onPaymentRecorded={loadPayments}
            />
        </div>
    );
}
