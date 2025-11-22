import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Wallet,
    Building2,
    Calendar,
    DollarSign,
    FileText,
    Loader2,
    Bell,
    Receipt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { expenseService } from '@/api/expenseService';
import { propertyService } from '@/features/properties/propertyService';
import { Property } from '@/types/property';
import { toast } from 'sonner';

export default function NewExpensePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [properties, setProperties] = useState<Property[]>([]);

    const [formData, setFormData] = useState({
        propertyId: '',
        amount: '',
        category: '',
        incurredAt: new Date().toISOString().split('T')[0],
        note: '',
        receiptUrl: ''
    });

    useEffect(() => {
        loadProperties();
        if (id) {
            loadExpense(id);
        }
    }, [id]);

    const loadProperties = async () => {
        try {
            const data = await propertyService.getProperties();
            setProperties(data);
        } catch (error) {
            console.error('Failed to load properties:', error);
            toast.error('Failed to load properties');
        }
    };

    const loadExpense = async (expenseId: string) => {
        try {
            const expense = await expenseService.getExpense(expenseId);
            setFormData({
                propertyId: expense.propertyId,
                amount: expense.amount.toString(),
                category: expense.category,
                incurredAt: new Date(expense.incurredAt).toISOString().split('T')[0],
                note: expense.note || '',
                receiptUrl: expense.receiptUrl || ''
            });
        } catch (error) {
            console.error('Failed to load expense:', error);
            toast.error('Failed to load expense details');
            navigate('/dashboard/expenses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.propertyId || !formData.amount || !formData.category || !formData.incurredAt) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                propertyId: formData.propertyId,
                amount: parseFloat(formData.amount),
                category: formData.category,
                incurredAt: new Date(formData.incurredAt).toISOString(),
                note: formData.note,
                receiptUrl: formData.receiptUrl || undefined
            };

            if (isEditMode && id) {
                await expenseService.updateExpense(id, payload);
                toast.success('Expense updated successfully');
            } else {
                await expenseService.createExpense(payload);
                toast.success('Expense logged successfully');
            }
            navigate('/dashboard/expenses');
        } catch (error: any) {
            console.error('Failed to save expense:', error);
            toast.error(error?.message || 'Failed to save expense');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-32">
            {/* Professional Sticky Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Expense' : 'Log Expense'}</h1>
                                <p className="text-sm text-gray-500">{isEditMode ? 'Update expense details' : 'Record a new property expense'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Expense Details */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Expense Details</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Property <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <select
                                        value={formData.propertyId}
                                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                        required
                                    >
                                        <option value="">Select Property</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Amount <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Category <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Repairs">Repairs</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Insurance">Insurance</option>
                                        <option value="Taxes">Taxes</option>
                                        <option value="Management Fees">Management Fees</option>
                                        <option value="Supplies">Supplies</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Date Incurred <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={formData.incurredAt}
                                        onChange={(e) => setFormData({ ...formData, incurredAt: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Description / Note</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px]"
                                        placeholder="Add details about this expense..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(-1)}
                            className="px-6"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-gray-900 hover:bg-gray-800 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                isEditMode ? 'Update Expense' : 'Log Expense'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
