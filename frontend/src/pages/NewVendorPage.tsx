import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    User,
    Building2,
    Phone,
    Mail,
    MapPin,
    Shield,
    Loader2,
    Bell,
    Wrench
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { vendorService } from '@/api/vendorService';
import { toast } from 'sonner';
import { PropertyUnitSelector } from '@/components/PropertyUnitSelector';

export default function NewVendorPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || '/dashboard/vendors';
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        companyName: '',
        category: '',
        phone: '',
        email: '',
        address: '',
        insured: false,
        rateInfo: ''
    });

    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadVendor(id);
        }
    }, [id]);

    const loadVendor = async (vendorId: string) => {
        try {
            const vendor = await vendorService.getVendor(vendorId);
            setFormData({
                name: vendor.name,
                companyName: vendor.companyName || '',
                category: vendor.category || '',
                phone: vendor.phone || '',
                email: vendor.email || '',
                address: vendor.address || '',
                insured: vendor.insured || false,
                rateInfo: vendor.rateInfo || ''
            });
            setSelectedProperties(vendor.properties?.map(p => p.id) || []);
            setSelectedUnits(vendor.units?.map(u => u.id) || []);
        } catch (error) {
            console.error('Failed to load vendor:', error);
            toast.error(t('newVendor.validation.loadError'));
            navigate(returnTo);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error(t('newVendor.validation.requiredFields'));
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                companyName: formData.companyName,
                category: formData.category,
                phone: formData.phone,
                email: formData.email,
                address: formData.address,
                insured: formData.insured,
                rateInfo: formData.rateInfo,
                propertyIds: selectedProperties,
                unitIds: selectedUnits
            };

            if (isEditMode && id) {
                await vendorService.updateVendor(id, payload);
                toast.success(t('newVendor.validation.updateSuccess'));
            } else {
                await vendorService.createVendor(payload);
                toast.success(t('newVendor.validation.createSuccess'));
            }
            navigate(returnTo);
        } catch (error: any) {
            console.error('Failed to save vendor:', error);
            toast.error(error?.message || t('newVendor.validation.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('newVendor.loading')}</p>
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
                                onClick={() => navigate(returnTo)}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? t('newVendor.editTitle') : t('newVendor.title')}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? t('newVendor.editSubtitle') : t('newVendor.subtitle')}</p>
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
                    {/* Basic Information */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newVendor.basicInfo.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.basicInfo.contactName')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newVendor.basicInfo.contactNamePlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.basicInfo.companyName')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newVendor.basicInfo.companyNamePlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.basicInfo.category')}</label>
                                <div className="relative">
                                    <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                    >
                                        <option value="">{t('newVendor.basicInfo.selectCategory')}</option>
                                        <option value="Plumbing">{t('newVendor.categories.plumbing')}</option>
                                        <option value="Electrical">{t('newVendor.categories.electrical')}</option>
                                        <option value="HVAC">{t('newVendor.categories.hvac')}</option>
                                        <option value="General Contractor">{t('newVendor.categories.generalContractor')}</option>
                                        <option value="Cleaning">{t('newVendor.categories.cleaning')}</option>
                                        <option value="Landscaping">{t('newVendor.categories.landscaping')}</option>
                                        <option value="Pest Control">{t('newVendor.categories.pestControl')}</option>
                                        <option value="Other">{t('newVendor.categories.other')}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newVendor.contactDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.contactDetails.phoneNumber')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newVendor.contactDetails.phonePlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.contactDetails.emailAddress')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newVendor.contactDetails.emailPlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.contactDetails.address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newVendor.contactDetails.addressPlaceholder')}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">{t('newVendor.additionalInfo.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="insured"
                                    checked={formData.insured}
                                    onChange={(e) => setFormData({ ...formData, insured: e.target.checked })}
                                    className="w-5 h-5 rounded border-input text-primary focus:ring-primary bg-background"
                                />
                                <label htmlFor="insured" className="text-sm font-medium text-foreground">
                                    {t('newVendor.additionalInfo.vendorInsured')}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newVendor.additionalInfo.rateInfo')}</label>
                                <textarea
                                    value={formData.rateInfo}
                                    onChange={(e) => setFormData({ ...formData, rateInfo: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                                    placeholder={t('newVendor.additionalInfo.rateInfoPlaceholder')}
                                />
                            </div>
                        </div>
                    </div>



                    {/* Property & Unit Assignment */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">Property Assignment</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                Assign this vendor to specific properties or units.
                            </p>
                            <PropertyUnitSelector
                                selectedProperties={selectedProperties}
                                selectedUnits={selectedUnits}
                                onPropertiesChange={setSelectedProperties}
                                onUnitsChange={setSelectedUnits}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(returnTo)}
                            className="px-6"
                            disabled={isSubmitting}
                        >
                            {t('newVendor.actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('newVendor.actions.saving')}
                                </>
                            ) : (
                                isEditMode ? t('newVendor.actions.update') : t('newVendor.actions.create')
                            )}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
