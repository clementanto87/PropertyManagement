import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export type UnitStatus = 'VACANT' | 'OCCUPIED' | 'MAINTENANCE';

type Unit = {
    id?: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sizeSqft?: number;
    status: UnitStatus;
    propertyId: string;
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

    useEffect(() => {
        if (unit) {
            setFormData(unit);
        } else {
            setFormData({
                unitNumber: '',
                bedrooms: 1,
                bathrooms: 1,
                sizeSqft: 0,
                status: 'VACANT',
                propertyId
            });
        }
    }, [unit, propertyId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);

            if (isEditMode && unit?.id) {
                await api.patch(`/units/${unit.id}`, formData);
                toast.success('Unit updated successfully');
            } else {
                await api.post('/units', formData);
                toast.success('Unit added successfully');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving unit:', error);
            toast.error(`Failed to ${isEditMode ? 'update' : 'add'} unit`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full shadow-xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {isEditMode ? 'Edit Unit' : 'Add New Unit'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isEditMode ? 'Update unit information' : 'Add a new unit to this property'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Unit Number */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Unit Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.unitNumber}
                                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="e.g., 101, A1, etc."
                                required
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as UnitStatus })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                required
                            >
                                <option value="VACANT">Vacant</option>
                                <option value="OCCUPIED">Occupied</option>
                                <option value="MAINTENANCE">Maintenance</option>
                            </select>
                        </div>

                        {/* Bedrooms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Bedrooms <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.bedrooms}
                                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Bathrooms */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Bathrooms <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.5"
                                value={formData.bathrooms}
                                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                required
                            />
                        </div>

                        {/* Square Feet */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700">
                                Square Feet
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.sizeSqft || ''}
                                onChange={(e) => setFormData({ ...formData, sizeSqft: parseInt(e.target.value) || undefined })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                placeholder="e.g., 850"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {isEditMode ? 'Updating...' : 'Adding...'}
                                </>
                            ) : (
                                isEditMode ? 'Update Unit' : 'Add Unit'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
