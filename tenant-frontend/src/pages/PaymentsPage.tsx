import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, CheckCircle2, Plus, Loader2, Download } from 'lucide-react';
import { tenant } from '../services/api';
import { motion } from 'framer-motion';
import { PaymentModal } from '../components/PaymentModal';

export function PaymentsPage() {
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
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Payments</h1>
          <p className="text-muted-foreground mt-1">Manage your rent and view payment history.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Make Payment
        </Button>
      </div>

      {/* Next Payment Card */}
      {nextPayment ? (
        <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-100">Next Payment</CardTitle>
            <CardDescription className="text-blue-200">
              Due on {nextPayment.dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
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
              Pay Now <CreditCard className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-gray-100 to-gray-200 border-none shadow-xl">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No payment history available to calculate next payment.</p>
          </CardContent>
        </Card>
      )
      }

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Manage your saved payment methods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded border">
                <CreditCard className="h-6 w-6 text-gray-700" />
              </div>
              <div>
                <p className="font-medium">Visa ending in 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/24</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Edit</Button>
          </div>
          <Button variant="outline" className="w-full border-dashed">
            <Plus className="mr-2 h-4 w-4" /> Add New Method
          </Button>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>A record of all your past payments.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium border-b border-border">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Method</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <motion.tbody
                className="divide-y divide-border bg-white"
                variants={container}
                initial="hidden"
                animate="show"
              >
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                      No payment history found.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <motion.tr
                      key={payment.id}
                      variants={item}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">Rent for {new Date(payment.dueDate).toLocaleString('default', { month: 'long', year: 'numeric' })}</td>
                      <td className="px-4 py-3 text-muted-foreground">{payment.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-3 font-medium">${payment.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-green-100 text-green-700' :
                          payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
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
                            Pay Now
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
