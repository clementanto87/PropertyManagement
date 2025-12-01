import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, CheckCircle2, Plus, Loader2, Download } from 'lucide-react';
import { tenant } from '../services/api';
import { motion } from 'framer-motion';
import { PaymentModal } from '../components/PaymentModal';
import { useTranslation } from 'react-i18next';
// import { toast } from 'sonner';

export function PaymentsPage() {
  const { t } = useTranslation();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchPayments = async () => {
    try {
      const { data } = await tenant.getPayments();
      setPayments(data);
    } catch (error) {
      console.error('Failed to fetch payments', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    setSelectedPayment(null);
    fetchPayments(); // Refresh the list
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  // Calculate next payment
  const getNextPayment = () => {
    if (payments.length === 0) return null;

    // Find the most recent payment to estimate next one
    const sortedPayments = [...payments].sort((a, b) =>
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
    const lastPayment = sortedPayments[0];

    // Calculate next month
    const nextDueDate = new Date(lastPayment.dueDate);
    nextDueDate.setMonth(nextDueDate.getMonth() + 1);

    return {
      amount: lastPayment.amount,
      dueDate: nextDueDate,
      description: `Rent for ${nextDueDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`
    };
  };

  const nextPayment = getNextPayment();

  return (
    <div className="space-y-8 animate-in fade-in duration-500" >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('payments.title')}</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('payments.subtitle')}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('payments.makePayment')}
        </Button>
      </div>

      {/* Next Payment Card */}
      {nextPayment ? (
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-100">{t('payments.nextPayment')}</CardTitle>
            <CardDescription className="text-blue-200">
              {t('payments.dueOn', { date: nextPayment.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${nextPayment.amount.toLocaleString()}</div>
            <p className="text-blue-200 mt-2 text-sm">{nextPayment.description}</p>
          </CardContent>
          <CardFooter>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => handlePayNow({ id: payments[0]?.id, amount: nextPayment.amount, dueDate: nextPayment.dueDate })}
            >
              {t('payments.payNow')} <CreditCard className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-none shadow-xl">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">{t('payments.noHistory')}</p>
          </CardContent>
        </Card>
      )
      }

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentMethods')}</CardTitle>
          <CardDescription>{t('payments.manageMethods')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-4">
              <div className="bg-white dark:bg-gray-700 p-2 rounded border dark:border-gray-600">
                <CreditCard className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground dark:text-gray-400">Expires 12/24</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">{t('common.edit')}</Button>
          </div>
          <Button variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> {t('payments.addNewMethod')}
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>{t('payments.paymentHistory')}</CardTitle>
          <CardDescription>{t('payments.historyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border dark:border-gray-700 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium border-b border-border dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3">{t('payments.date')}</th>
                  <th className="px-4 py-3">{t('payments.description')}</th>
                  <th className="px-4 py-3">{t('payments.method')}</th>
                  <th className="px-4 py-3">{t('payments.amount')}</th>
                  <th className="px-4 py-3">{t('payments.status')}</th>
                  <th className="px-4 py-3 text-right">{t('payments.actions')}</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-border dark:divide-gray-700 bg-white dark:bg-gray-900"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground dark:text-gray-400">
                      {t('payments.noHistory')}
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      variants={item}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{t('payments.rentFor', { month: new Date(payment.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' }) })}</td>
                      <td className="px-4 py-3 text-muted-foreground dark:text-gray-400">{payment.paymentMethod || t('common.none')}</td>
                      <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">${payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          }`}>
                          {payment.status === 'PAID' && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {payment.status === 'PAID' ? (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handlePayNow({ id: payment.id, amount: payment.amount, dueDate: payment.dueDate })}
                          >
                            <CreditCard className="mr-1 h-3 w-3" />
                            {t('payments.payNow')}
                          </Button>
                        )}
                      </td>
                    </motion.tr>
                  )))}
              </motion.tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <PaymentModal
          paymentId={selectedPayment.id}
          amount={selectedPayment.amount}
          dueDate={selectedPayment.dueDate}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div >
  );
}
