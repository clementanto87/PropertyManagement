import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
            toast.error('Failed to load properties or vendors');
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
            toast.error('Failed to load units');
        }
    };

    const loadWorkOrder = async (workOrderId: string) => {
        try {
            const workOrder = await workOrderService.getWorkOrder(workOrderId);

            const propertyId = workOrder.unit?.property?.id || ''; // Assuming backend returns this structure

            setFormData({
                propertyId: propertyId, // We might not get this directly if not populated, but let's assume for now
                unitId: workOrder.unitId,
                vendorId: workOrder.vendorId || '',
                title: workOrder.title,
                description: workOrder.description || '',
                status: workOrder.status
            });

            // If we have propertyId, units will be loaded by useEffect
            // But if propertyId is missing from response (e.g. only unitId returned), we might have trouble pre-selecting property
            // For now, let's assume unit includes property relation
        } catch (error) {
            console.error('Failed to load work order:', error);
            toast.error('Failed to load work order details');
            navigate('/dashboard/work-orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.unitId || !formData.title) {
            toast.error('Please fill in all required fields');
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
                toast.success('Work order updated successfully');
            } else {
                await workOrderService.createWorkOrder(payload);
                toast.success('Work order created successfully');
            }
            navigate('/dashboard/work-orders');
        } catch (error: any) {
            console.error('Failed to save work order:', error);
            toast.error(error?.message || 'Failed to save work order');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || loadingData) {
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
                                <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Work Order' : 'New Work Order'}</h1>
                                <p className="text-sm text-gray-500">{isEditMode ? 'Update work order details' : 'Create a new maintenance request'}</p>
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
                    {/* Location Details */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Location Details</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Property <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.propertyId}
                                    onChange={(e) => setFormData({ ...formData, propertyId: e.target.value, unitId: '' })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                    required
                                >
                                    <option value="">Select Property</option>
                                    {properties.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Unit <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.unitId}
                                    onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                    required
                                    disabled={!formData.propertyId}
                                >
                                    <option value="">Select Unit</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id}>
                                            Unit {u.unitNumber} ({u.status})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Issue Details */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Issue Details</h2>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    placeholder="e.g., Leaky Faucet in Kitchen"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors min-h-[120px]"
                                    placeholder="Describe the issue in detail..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignment & Status */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Wrench className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Assignment & Status</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Assign Vendor</label>
                                <select
                                    value={formData.vendorId}
                                    onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="">Unassigned</option>
                                    {vendors.map(v => (
                                        <option key={v.id} value={v.id}>{v.name} {v.companyName ? `(${v.companyName})` : ''}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as WorkOrderStatus })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="NEW">New</option>
                                    <option value="ASSIGNED">Assigned</option>
                                    <option value="IN_PROGRESS">In Progress</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
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
                                isEditMode ? 'Update Work Order' : 'Create Work Order'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
