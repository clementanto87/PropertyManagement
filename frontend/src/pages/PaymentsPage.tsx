import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, Filter, Receipt, Download } from 'lucide-react';
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
    const { t } = useTranslation();
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
            toast.error(t('payments.errors.loadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowRecordDialog(true);
    };

    const handleDownloadReceipt = async (paymentId: string) => {
        try {
            const blob = await paymentService.downloadReceipt(paymentId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `receipt-${paymentId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(t('payments.success.receiptDownloaded'));
        } catch (error) {
            console.error('Failed to download receipt:', error);
            toast.error(t('payments.errors.downloadReceiptFailed'));
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PAID: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
            PENDING: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
            OVERDUE: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            PAID: t('payments.status.paid'),
            PENDING: t('payments.status.pending'),
            OVERDUE: t('payments.status.overdue'),
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">{t('payments.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border sticky top-0 z-10">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-foreground">{t('payments.title')}</h1>
                            <p className="text-sm text-muted-foreground">{t('payments.subtitle')}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder={t('payments.allStatuses')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('payments.allStatuses')}</SelectItem>
                                    <SelectItem value="PENDING">{t('payments.status.pending')}</SelectItem>
                                    <SelectItem value="PAID">{t('payments.status.paid')}</SelectItem>
                                    <SelectItem value="OVERDUE">{t('payments.status.overdue')}</SelectItem>
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
                                <TableHead>{t('payments.table.tenant')}</TableHead>
                                <TableHead>{t('payments.table.property')}</TableHead>
                                <TableHead>{t('payments.table.amount')}</TableHead>
                                <TableHead>{t('payments.table.dueDate')}</TableHead>
                                <TableHead>{t('payments.table.status')}</TableHead>
                                <TableHead>{t('payments.table.receiptNumber')}</TableHead>
                                <TableHead className="text-right">{t('payments.table.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">{t('payments.noPayments')}</p>
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
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                                {format(new Date(payment.dueDate), 'MMM dd, yyyy')}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                                                {getStatusLabel(payment.status)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
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
                                                    {t('payments.actions.recordPayment')}
                                                </Button>
                                            )}
                                            {payment.status === 'PAID' && (
                                                <div className="flex flex-col items-end gap-1">
                                                    {payment.paidAt && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {t('payments.actions.paid')} {format(new Date(payment.paidAt), 'MMM dd')}
                                                        </span>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadReceipt(payment.id)}
                                                        className="h-8 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    >
                                                        <Download className="h-4 w-4 mr-1" />
                                                        {t('payments.actions.receipt')}
                                                    </Button>
                                                </div>
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
