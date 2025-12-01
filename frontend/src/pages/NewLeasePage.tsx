import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Calendar,
    DollarSign,
    Building2,
    User,
    Loader2,
    Bell,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { leaseService, type Lease } from '@/api/leaseService';
import { tenantService, type Tenant } from '@/api/tenantService';
import { propertyService } from '@/features/properties/propertyService';
import { Property } from '@/types/property';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Unit = {
    id: string;
    unitNumber: string;
    status: string;
};

export default function NewLeasePage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data for dropdowns
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        tenantId: '',
        propertyId: '',
        unitId: '',
        startDate: '',
        endDate: '',
        rentAmount: '',
        securityDeposit: '',
        status: 'ACTIVE'
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (id) {
            loadLease(id);
        }
    }, [id]);

    useEffect(() => {
        if (formData.propertyId) {
            loadUnits(formData.propertyId);
        } else {
            setUnits([]);
        }
    }, [formData.propertyId]);

    const loadInitialData = async () => {
        try {
            const [tenantsData, propertiesData] = await Promise.all([
                tenantService.getTenants({ limit: 100 }),
                propertyService.getProperties()
            ]);
            setTenants(tenantsData.items);
            setProperties(propertiesData);
        } catch (error) {
            console.error('Failed to load form data:', error);
            toast.error(t('newLease.validation.loadDataError'));
        } finally {
            setLoadingData(false);
        }
    };

    const loadUnits = async (propertyId: string) => {
        try {
            const response = await api.get<{ items: Unit[] }>(`/units?propertyId=${propertyId}`);
            setUnits(response.items || []);
        } catch (error) {
            console.error('Failed to load units:', error);
            toast.error(t('newLease.validation.loadUnitsError'));
        }
    };

    const loadLease = async (leaseId: string) => {
        try {
            const lease = await leaseService.getLease(leaseId);

            const propertyId = lease.unit?.property?.id || '';

            setFormData({
                tenantId: lease.tenantId,
                propertyId: propertyId,
                unitId: lease.unitId,
                startDate: lease.startDate.split('T')[0],
                endDate: lease.endDate.split('T')[0],
                rentAmount: lease.rentAmount.toString(),
                securityDeposit: lease.securityDeposit?.toString() || '',
                status: lease.status
            });
        } catch (error) {
            console.error('Failed to load lease:', error);
            toast.error(t('newLease.validation.loadError'));
            navigate('/dashboard/leases');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tenantId || !formData.unitId || !formData.startDate || !formData.endDate || !formData.rentAmount) {
            toast.error(t('newLease.validation.requiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                tenantId: formData.tenantId,
                unitId: formData.unitId,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                rentAmount: parseFloat(formData.rentAmount),
                securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : undefined,
                status: formData.status as any
            };

            if (isEditMode && id) {
                await leaseService.updateLease(id, payload);
                toast.success(t('newLease.validation.updateSuccess'));
            } else {
                await leaseService.createLease(payload);
                toast.success(t('newLease.validation.createSuccess'));
            }
            navigate('/dashboard/leases');
        } catch (error: any) {
            console.error('Failed to save lease:', error);
            toast.error(error?.message || t('newLease.validation.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('newLease.loading')}</p>
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
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? t('newLease.editTitle') : t('newLease.title')}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? t('newLease.editSubtitle') : t('newLease.subtitle')}</p>
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
                    {/* Property & Unit Selection */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newLease.propertyDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.propertyDetails.property')} <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitId: '' })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">{t('newLease.propertyDetails.selectProperty')}</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.propertyDetails.unit')} <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.unitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                    disabled={!formData.propertyId}
                                >
                                    <option value="">{t('newLease.propertyDetails.selectUnit')}</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {t('newLease.propertyDetails.unit')} {u.unitNumber} ({u.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tenant Selection */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newLease.tenant.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.tenant.selectTenant')} <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                >
                                    <option value="">{t('newLease.tenant.selectTenant')}</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {t('newLease.tenant.cantFind')} <a href="/dashboard/tenants/new" className="text-blue-600 dark:text-blue-400 hover:underline">{t('newLease.tenant.addNew')}</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lease Terms & Financials */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newLease.termsFinancials.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.termsFinancials.startDate')} <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.termsFinancials.endDate')} <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.termsFinancials.monthlyRent')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.rentAmount}
                                        onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder={t('newLease.termsFinancials.placeholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.termsFinancials.securityDeposit')}</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.securityDeposit}
                                        onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder={t('newLease.termsFinancials.placeholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newLease.termsFinancials.status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                >
                                    <option value="ACTIVE">{t('newLease.statusOptions.active')}</option>
                                    <option value="PENDING">{t('newLease.statusOptions.pending')}</option>
                                    <option value="EXPIRED">{t('newLease.statusOptions.expired')}</option>
                                    <option value="TERMINATED">{t('newLease.statusOptions.terminated')}</option>
                                </select>
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
                            {t('newLease.actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('newLease.actions.saving')}
                                </>
                            ) : (
                                isEditMode ? t('newLease.actions.update') : t('newLease.actions.create')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
