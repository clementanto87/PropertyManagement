import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            toast.error(t('newExpense.validation.loadPropertiesError'));
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
            toast.error(t('newExpense.validation.loadError'));
            navigate('/dashboard/expenses');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.propertyId || !formData.amount || !formData.category || !formData.incurredAt) {
            toast.error(t('newExpense.validation.requiredFields'));
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
                toast.success(t('newExpense.validation.updateSuccess'));
            } else {
                await expenseService.createExpense(payload);
                toast.success(t('newExpense.validation.logSuccess'));
            }
            navigate('/dashboard/expenses');
        } catch (error: any) {
            console.error('Failed to save expense:', error);
            toast.error(error?.message || t('newExpense.validation.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('newExpense.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Professional Sticky Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? t('newExpense.editTitle') : t('newExpense.title')}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? t('newExpense.editSubtitle') : t('newExpense.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Expense Details */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Wallet className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newExpense.expenseDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newExpense.expenseDetails.property')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <select
                                        value={formData.propertyId}
                                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                        required
                                    >
                                        <option value="">{t('newExpense.expenseDetails.selectProperty')}</option>
                                        {properties.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newExpense.expenseDetails.amount')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newExpense.expenseDetails.amountPlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newExpense.expenseDetails.category')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                        required
                                    >
                                        <option value="">{t('newExpense.expenseDetails.selectCategory')}</option>
                                        <option value="Maintenance">{t('newExpense.categories.maintenance')}</option>
                                        <option value="Repairs">{t('newExpense.categories.repairs')}</option>
                                        <option value="Utilities">{t('newExpense.categories.utilities')}</option>
                                        <option value="Insurance">{t('newExpense.categories.insurance')}</option>
                                        <option value="Taxes">{t('newExpense.categories.taxes')}</option>
                                        <option value="Management Fees">{t('newExpense.categories.managementFees')}</option>
                                        <option value="Supplies">{t('newExpense.categories.supplies')}</option>
                                        <option value="Other">{t('newExpense.categories.other')}</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newExpense.expenseDetails.dateIncurred')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="date"
                                        value={formData.incurredAt}
                                        onChange={(e) => setFormData({ ...formData, incurredAt: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">{t('newExpense.expenseDetails.descriptionNote')}</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <textarea
                                        value={formData.note}
                                        onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newExpense.expenseDetails.descriptionPlaceholder')}
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
                            {t('newExpense.actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('newExpense.actions.saving')}
                                </>
                            ) : (
                                isEditMode ? t('newExpense.actions.update') : t('newExpense.actions.log')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
