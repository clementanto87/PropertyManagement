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
import { careTakerService } from '@/api/careTakerService';
import { toast } from 'sonner';
import { PropertyUnitSelector } from '@/components/PropertyUnitSelector';

export default function NewCareTakerPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || '/dashboard/caretakers';
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
            loadCareTaker(id);
        }
    }, [id]);

    const loadCareTaker = async (careTakerId: string) => {
        try {
            const careTaker = await careTakerService.getCareTaker(careTakerId);
            setFormData({
                name: careTaker.name,
                companyName: careTaker.companyName || '',
                category: careTaker.category || '',
                phone: careTaker.phone || '',
                email: careTaker.email || '',
                address: careTaker.address || '',
                insured: careTaker.insured || false,
                rateInfo: careTaker.rateInfo || ''
            });
            setSelectedProperties(careTaker.properties?.map(p => p.id) || []);
            setSelectedUnits(careTaker.units?.map(u => u.id) || []);
        } catch (error) {
            console.error('Failed to load caretaker:', error);
            toast.error(t('newCareTaker.validation.loadError'));
            navigate(returnTo);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast.error(t('newCareTaker.validation.requiredFields'));
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
                await careTakerService.updateCareTaker(id, payload);
                toast.success(t('newCareTaker.validation.updateSuccess'));
            } else {
                await careTakerService.createCareTaker(payload);
                toast.success(t('newCareTaker.validation.createSuccess'));
            }
            navigate(returnTo);
        } catch (error: any) {
            console.error('Failed to save care taker:', error);
            toast.error(error?.message || t('newCareTaker.validation.error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('newCareTaker.loading')}</p>
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
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? t('newCareTaker.editTitle') : t('newCareTaker.title')}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? t('newCareTaker.editSubtitle') : t('newCareTaker.subtitle')}</p>
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
                                <h2 className="text-base font-bold text-foreground">{t('newCareTaker.basicInfo.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.basicInfo.contactName')} <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newCareTaker.basicInfo.contactNamePlaceholder')}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.basicInfo.companyName')}</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.companyName}
                                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newCareTaker.basicInfo.companyNamePlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.basicInfo.category')}</label>
                                <div className="relative">
                                    <Wrench className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground"
                                    >
                                        <option value="">{t('newCareTaker.basicInfo.selectCategory')}</option>
                                        <option value="Caretaker">Caretaker</option>
                                        <option value="Security">Security</option>
                                        <option value="Cleaning">Cleaning</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Other">Other</option>
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
                                <h2 className="text-base font-bold text-foreground">{t('newCareTaker.contactDetails.title')}</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.contactDetails.phoneNumber')}</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newCareTaker.contactDetails.phonePlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.contactDetails.emailAddress')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newCareTaker.contactDetails.emailPlaceholder')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.contactDetails.address')}</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder={t('newCareTaker.contactDetails.addressPlaceholder')}
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
                                <h2 className="text-base font-bold text-foreground">{t('newCareTaker.additionalInfo.title')}</h2>
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
                                    {t('newCareTaker.additionalInfo.careTakerInsured')}
                                </label>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">{t('newCareTaker.additionalInfo.rateInfo')}</label>
                                <textarea
                                    value={formData.rateInfo}
                                    onChange={(e) => setFormData({ ...formData, rateInfo: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[100px] bg-background text-foreground placeholder:text-muted-foreground"
                                    placeholder={t('newCareTaker.additionalInfo.rateInfoPlaceholder')}
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
                                Assign this care taker to specific properties or units.
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
                            {t('newCareTaker.actions.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('newCareTaker.actions.saving')}
                                </>
                            ) : (
                                isEditMode ? t('newCareTaker.actions.update') : t('newCareTaker.actions.create')
                            )}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
