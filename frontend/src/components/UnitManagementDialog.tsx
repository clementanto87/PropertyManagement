import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { MultiSelect } from './ui/multi-select';

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

type Unit = {
    id?: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sizeSqft?: number;
    status: UnitStatus;
    propertyId: string;
    managerIds?: string[];
    careTakerIds?: string[];
    houseOwnerIds?: string[];
};

type UnitManagementDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    propertyId: string;
    unit?: Unit;
};

export function UnitManagementDialog({
    isOpen,
    onClose,
    onSuccess,
    propertyId,
    unit
}: UnitManagementDialogProps) {
    const { t } = useTranslation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Unit>({
        unitNumber: '',
        bedrooms: 1,
        bathrooms: 1,
        sizeSqft: 0,
        status: 'VACANT',
        propertyId
    });

    const isEditMode = !!unit;

    const [managers, setManagers] = useState<{ id: string; name: string }[]>([]);
    const [careTakers, setCareTakers] = useState<{ id: string; name: string }[]>([]);
    const [houseOwners, setHouseOwners] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [managersRes, careTakersRes, houseOwnersRes] = await Promise.all([
                    api.get<{ id: string; name: string }[]>('/users?role=MANAGER'),
                    api.get<{ items: { id: string; name: string }[] }>('/caretakers'),
                    api.get<{ items: { id: string; name: string }[] }>('/houseowners')
                ]);
                // Managers endpoint returns array directly
                setManagers(Array.isArray(managersRes) ? managersRes : (managersRes as any).items || []);
                setCareTakers(careTakersRes.items || []);
                setHouseOwners(houseOwnersRes.items || []);
            } catch (error) {
                console.error('Failed to fetch options:', error);
            }
        };
        fetchOptions();
    }, []);

    useEffect(() => {
        if (unit) {
            setFormData({
                ...unit,
                managerIds: (unit as any).managers?.map((m: any) => m.id) || [],
                careTakerIds: (unit as any).caretakers?.map((c: any) => c.id) || [],
                houseOwnerIds: (unit as any).houseOwners?.map((h: any) => h.id) || []
            });
        } else {
            setFormData({
                unitNumber: '',
                bedrooms: 1,
                bathrooms: 1,
                sizeSqft: 0,
                status: 'VACANT',
                propertyId,
                managerIds: [],
                careTakerIds: [],
                houseOwnerIds: []
            });
        }
    }, [unit, propertyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            if (isEditMode && unit?.id) {
                await api.patch(`/units/${unit.id}`, formData);
                toast.success(t('unitDialog.updateSuccess'));
            } else {
                await api.post('/units', formData);
                toast.success(t('unitDialog.addSuccess'));
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving unit:', error);
            toast.error(isEditMode ? t('unitDialog.updateError') : t('unitDialog.addError'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-card rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-border">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-border">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">
                            {isEditMode ? t('unitDialog.editTitle') : t('unitDialog.addTitle')}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-muted-foreground mt-1">
                            {isEditMode ? t('unitDialog.editSubtitle') : t('unitDialog.addSubtitle')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-muted-foreground" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Unit Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                {t('unitDialog.unitNumber')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.unitNumber}
                                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder={t('unitDialog.unitNumberPlaceholder')}
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                {t('unitDialog.status')} <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                required
                            >
                                <option value="VACANT">{t('unitDialog.statusOptions.vacant')}</option>
                                <option value="OCCUPIED">{t('unitDialog.statusOptions.occupied')}</option>
                                <option value="MAINTENANCE">{t('unitDialog.statusOptions.maintenance')}</option>
                            </select>
                        </div>

                        {/* Bedrooms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                {t('unitDialog.bedrooms')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Bathrooms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                {t('unitDialog.bathrooms')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Square Feet */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                {t('unitDialog.size')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.sizeSqft || ''}
                                onChange={(e) => setFormData({ ...formData, sizeSqft: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder={t('unitDialog.sizePlaceholder')}
                            />
                        </div>

                        {/* Assignments Section */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-200 dark:border-border">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-foreground">Assignments</h3>

                            {/* Managers */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                    Managers
                                </label>
                                <MultiSelect
                                    options={managers.map(m => ({ label: m.name, value: m.id }))}
                                    selected={formData.managerIds || []}
                                    onChange={(selected) => setFormData({ ...formData, managerIds: selected })}
                                    placeholder="Select Managers..."
                                />
                            </div>

                            {/* Care Takers */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                    Care Takers
                                </label>
                                <MultiSelect
                                    options={careTakers.map(ct => ({ label: ct.name, value: ct.id }))}
                                    selected={formData.careTakerIds || []}
                                    onChange={(selected) => setFormData({ ...formData, careTakerIds: selected })}
                                    placeholder="Select Care Takers..."
                                />
                            </div>

                            {/* House Owners */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-muted-foreground">
                                    House Owners
                                </label>
                                <MultiSelect
                                    options={houseOwners.map(ho => ({ label: ho.name, value: ho.id }))}
                                    selected={formData.houseOwnerIds || []}
                                    onChange={(selected) => setFormData({ ...formData, houseOwnerIds: selected })}
                                    placeholder="Select House Owners..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-border">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            {t('unitDialog.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gray-900 hover:bg-gray-800 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? t('unitDialog.updating') : t('unitDialog.adding')}
                                </>
                            ) : (
                                isEditMode ? t('unitDialog.update') : t('unitDialog.add')
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
