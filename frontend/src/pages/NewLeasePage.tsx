import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
            toast.error('Failed to load tenants or properties');
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

    const loadLease = async (leaseId: string) => {
        try {
            const lease = await leaseService.getLease(leaseId);

            // We need to find the propertyId from the unitId
            // Since we don't have it directly, we might need to fetch the unit first or rely on the lease.unit relation if it exists
            // The lease object from service should have unit.propertyId if we included it, let's check leaseService type
            // The type has unit: { property: { id } }

            const propertyId = lease.unit?.property?.id || '';

            setFormData({
                tenantId: lease.tenantId,
                propertyId: propertyId,
                unitId: lease.unitId,
                startDate: lease.startDate.split('T')[0], // Format for date input
                endDate: lease.endDate.split('T')[0],
                rentAmount: lease.rentAmount.toString(),
                securityDeposit: lease.securityDeposit?.toString() || '',
                status: lease.status
            });

            // Units will be loaded by the useEffect when propertyId is set
        } catch (error) {
            console.error('Failed to load lease:', error);
            toast.error('Failed to load lease details');
            navigate('/dashboard/leases');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.tenantId || !formData.unitId || !formData.startDate || !formData.endDate || !formData.rentAmount) {
            toast.error('Please fill in all required fields');
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
                toast.success('Lease updated successfully');
            } else {
                await leaseService.createLease(payload);
                toast.success('Lease created successfully');
            }
            navigate('/dashboard/leases');
        } catch (error: any) {
            console.error('Failed to save lease:', error);
            toast.error(error?.message || 'Failed to save lease');
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
                                <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Lease' : 'New Lease'}</h1>
                                <p className="text-sm text-gray-500">{isEditMode ? 'Update lease details' : 'Create a new lease agreement'}</p>
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
                    {/* Property & Unit Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Property Details</h2>
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

                    {/* Tenant Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Tenant</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Select Tenant <span className="text-red-500">*</span></label>
                                <select
                                    value={formData.tenantId}
                                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                    required
                                >
                                    <option value="">Select Tenant</option>
                                    {tenants.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Can't find the tenant? <a href="/dashboard/tenants/new" className="text-blue-600 hover:underline">Add new tenant</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Lease Terms & Financials */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-gray-900">Terms & Financials</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Start Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">End Date <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Monthly Rent <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.rentAmount}
                                        onChange={(e) => setFormData({ ...formData, rentAmount: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Security Deposit</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.securityDeposit}
                                        onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-white"
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="PENDING">Pending</option>
                                    <option value="EXPIRED">Expired</option>
                                    <option value="TERMINATED">Terminated</option>
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
                                isEditMode ? 'Update Lease' : 'Create Lease'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
