import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Wrench,
    Building2,
    User,
    Loader2,
    Bell,
    FileText,
    AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { workOrderService, WorkOrderStatus } from '@/api/workOrderService';
import { propertyService } from '@/features/properties/propertyService';
import { Property } from '@/types/property';
import { api } from '@/lib/api';
import { toast } from 'sonner';

type Unit = {
    id: string;
    unitNumber: string;
    status: string;
};

type Vendor = {
    id: string;
    name: string;
    companyName?: string;
};

export default function NewWorkOrderPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Data for dropdowns
    const [properties, setProperties] = useState<Property[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [formData, setFormData] = useState({
        propertyId: '',
        unitId: '',
        vendorId: '',
        title: '',
        description: '',
        status: 'NEW' as WorkOrderStatus
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (id) {
            loadWorkOrder(id);
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
            const [propertiesData, vendorsData] = await Promise.all([
                propertyService.getProperties(),
                api.get<{ items: Vendor[] }>('/vendors')
            ]);
            setProperties(propertiesData);
            setVendors(vendorsData.items || []);
        } catch (error) {
            console.error('Failed to load form data:', error);
            toast.error(t('newWorkOrder.validation.loadDataError'));
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
            toast.error(t('newWorkOrder.validation.loadUnitsError'));
        }
    };

    const loadWorkOrder = async (workOrderId: string) => {
        try {
            const workOrder = await workOrderService.getWorkOrder(workOrderId);

            const propertyId = workOrder.unit?.property?.id || '';

            setFormData({
                propertyId: propertyId,
                unitId: workOrder.unitId,
                vendorId: workOrder.vendorId || '',
                title: workOrder.title,
                description: workOrder.description || '',
                status: workOrder.status
            });
        } catch (error) {
            console.error('Failed to load work order:', error);
            toast.error(t('newWorkOrder.validation.loadError'));
            navigate('/dashboard/work-orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.unitId || !formData.title) {
            toast.error(t('newWorkOrder.validation.requiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                unitId: formData.unitId,
                vendorId: formData.vendorId || undefined,
                title: formData.title,
                description: formData.description,
                status: formData.status
            };

            if (isEditMode && id) {
                await workOrderService.updateWorkOrder(id, payload);
                toast.success(t('newWorkOrder.validation.updateSuccess'));
            } else {
                await workOrderService.createWorkOrder(payload);
                toast.success(t('newWorkOrder.validation.createSuccess'));
            }
            navigate('/dashboard/work-orders');
        } catch (error: any) {
            console.error('Failed to save work order:', error);
            toast.error(error?.message || t('newWorkOrder.validation.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || loadingData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('newWorkOrder.loading')}</p>
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
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? t('newWorkOrder.editTitle') : t('newWorkOrder.title')}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? t('newWorkOrder.editSubtitle') : t('newWorkOrder.subtitle')}</p>
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
                    {/* Location Details */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newWorkOrder.locationDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.locationDetails.property')} <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitId: '' })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                    required
                                >
                                    <option value="">{t('newWorkOrder.locationDetails.selectProperty')}</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.locationDetails.unit')} <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.unitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                    required
                                    disabled={!formData.propertyId}
                                >
                                    <option value="">{t('newWorkOrder.locationDetails.selectUnit')}</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            {t('newWorkOrder.locationDetails.unit')} {u.unitNumber} ({u.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Issue Details */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newWorkOrder.issueDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.issueDetails.titleLabel')} <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                    placeholder={t('newWorkOrder.issueDetails.titlePlaceholder')}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.issueDetails.description')}</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[120px] bg-background text-foreground placeholder:text-muted-foreground"
                                    placeholder={t('newWorkOrder.issueDetails.descriptionPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment & Status */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newWorkOrder.assignmentStatus.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.assignmentStatus.assignVendor')}</label>
                                <select
                                    value={formData.vendorId}
                                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                >
                                    <option value="">{t('newWorkOrder.assignmentStatus.unassigned')}</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} {v.companyName ? `(${v.companyName})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newWorkOrder.assignmentStatus.status')}</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkOrderStatus })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                >
                                    <option value="NEW">{t('newWorkOrder.statusOptions.new')}</option>
                                    <option value="ASSIGNED">{t('newWorkOrder.statusOptions.assigned')}</option>
                                    <option value="IN_PROGRESS">{t('newWorkOrder.statusOptions.inProgress')}</option>
                                    <option value="ON_HOLD">{t('newWorkOrder.statusOptions.onHold')}</option>
                                    <option value="COMPLETED">{t('newWorkOrder.statusOptions.completed')}</option>
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
                            {t('newWorkOrder.actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('newWorkOrder.actions.saving')}
                                </>
                            ) : (
                                isEditMode ? t('newWorkOrder.actions.update') : t('newWorkOrder.actions.create')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
