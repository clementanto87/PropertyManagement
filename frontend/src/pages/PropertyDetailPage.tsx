import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    MapPin,
    Bed,
    Bath,
    Ruler,
    DollarSign,
    Edit,
    Trash2,
    Plus,
    Home,
    Users,
    TrendingUp,
    Building2,
    Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { propertyService } from '@/features/properties/propertyService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UnitManagementDialog, UnitStatus } from '@/components/UnitManagementDialog';

type Property = {
    id: string;
    name: string;
    address: string;
    type: string;
    status: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    area: string;
    image: string;
    description?: string;
    amenities?: string[];
};

type Unit = {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sizeSqft?: number;
    status: UnitStatus;
    propertyId: string;
    lease?: {
        tenant: {
            name: string;
        };
    };
};

export default function PropertyDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showUnitDialog, setShowUnitDialog] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | undefined>();
    const [unitToDelete, setUnitToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadPropertyData(id);
        }
    }, [id]);

    const loadPropertyData = async (propertyId: string) => {
        try {
            // Load property data
            const propertyData = await propertyService.getPropertyById(propertyId);
            setProperty(propertyData);

            // Load units for this property
            try {
                const unitsResponse = await api.get<{ items: Unit[] }>(`/units?propertyId=${propertyId}`);
                setUnits(unitsResponse.items || []);
            } catch (error) {
                console.error('Failed to load units:', error);
            }
        } catch (error) {
            console.error('Failed to load property:', error);
            toast.error('Failed to load property details');
            navigate('/dashboard/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        try {
            await propertyService.deleteProperty(id);
            toast.success('Property deleted successfully');
            navigate('/dashboard/properties');
        } catch (error) {
            console.error('Failed to delete property:', error);
            toast.error('Failed to delete property');
        }
    };

    const handleAddUnit = () => {
        setSelectedUnit(undefined);
        setShowUnitDialog(true);
    };

    const handleEditUnit = (unit: Unit) => {
        setSelectedUnit(unit);
        setShowUnitDialog(true);
    };

    const handleDeleteUnit = async (unitId: string) => {
        try {
            await api.delete(`/units/${unitId}`);
            toast.success('Unit deleted successfully');
            if (id) {
                loadPropertyData(id);
            }
            setUnitToDelete(null);
        } catch (error) {
            console.error('Failed to delete unit:', error);
            toast.error('Failed to delete unit');
        }
    };

    const handleUnitSuccess = () => {
        if (id) {
            loadPropertyData(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Loading Property Details</h2>
                </div>
            </div>
        );
    }

    if (!property) {
        return null;
    }

    const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
    const occupancyRate = units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0;
    // Rent amount is not currently available on the unit model
    const totalRent = 0;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Professional Sticky Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard/properties')}
                                className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Property Details</h1>
                                <p className="text-sm text-gray-500">View and manage property information</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                                <Bell className="w-5 h-5" />
                            </button>
                            <div className="h-8 w-px bg-gray-200 mx-1"></div>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(true)}
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                            <Button
                                onClick={() => navigate(`/dashboard/properties/${id}/edit`)}
                                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Property
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-7xl mx-auto space-y-6">
                {/* Property Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Property Image */}
                        <div className="h-80 lg:h-full relative">
                            <img
                                src={property.image}
                                alt={property.name}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium ${property.status === 'vacant' ? 'bg-emerald-500 text-white' :
                                property.status === 'occupied' ? 'bg-blue-500 text-white' :
                                    'bg-amber-500 text-white'
                                }`}>
                                {property.status === 'vacant' ? 'Available' : property.status === 'occupied' ? 'Occupied' : 'Maintenance'}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="p-8">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h2>
                                <p className="text-gray-600 flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {property.address}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <Bed className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bedrooms</p>
                                        <p className="text-lg font-semibold text-gray-900">{property.bedrooms}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                                        <Bath className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bathrooms</p>
                                        <p className="text-lg font-semibold text-gray-900">{property.bathrooms}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                        <Ruler className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Area</p>
                                        <p className="text-lg font-semibold text-gray-900">{property.area}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Rent</p>
                                        <p className="text-lg font-semibold text-gray-900">${property.price.toLocaleString()}/mo</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                                    {property.type}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Units</p>
                        <p className="text-3xl font-bold text-gray-900">{units.length}</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Occupancy Rate</p>
                        <p className="text-3xl font-bold text-gray-900">{occupancyRate}%</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">Total Monthly Rent</p>
                        <p className="text-3xl font-bold text-gray-900">${totalRent.toLocaleString()}</p>
                    </div>
                </div>

                {/* Units Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Units</h3>
                        <Button size="sm" className="gap-2" onClick={handleAddUnit}>
                            <Plus className="w-4 h-4" />
                            Add Unit
                        </Button>
                    </div>
                    <div className="p-6">
                        {units.length === 0 ? (
                            <div className="text-center py-12">
                                <Home className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No units added yet</p>
                                <p className="text-sm text-gray-400 mt-1">Add units to start managing tenants and leases</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {units.map((unit) => (
                                    <div key={unit.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Unit {unit.unitNumber}</h4>
                                                <p className="text-sm text-gray-500">{unit.sizeSqft ? `${unit.sizeSqft} sq ft` : 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.status === 'OCCUPIED' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'
                                                    }`}>
                                                    {unit.status}
                                                </span>
                                                <button
                                                    onClick={() => handleEditUnit(unit)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-blue-50 rounded transition-all"
                                                    title="Edit unit"
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600" />
                                                </button>
                                                <button
                                                    onClick={() => setUnitToDelete(unit.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                                                    title="Delete unit"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-500">Beds/Baths:</span>
                                                <span className="font-medium text-gray-900">{unit.bedrooms}bd / {unit.bathrooms}ba</span>
                                            </div>
                                            {/* Rent amount removed as it's not in the model */}
                                            {unit.lease?.tenant && (
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <span className="text-gray-500">Tenant:</span>
                                                    <span className="font-medium text-gray-900">{unit.lease.tenant.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Property</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{property.name}</strong>? This will also delete all associated units and data.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Property
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unit Management Dialog */}
            {showUnitDialog && (
                <UnitManagementDialog
                    isOpen={showUnitDialog}
                    onClose={() => setShowUnitDialog(false)}
                    onSuccess={handleUnitSuccess}
                    propertyId={id || ''}
                    unit={selectedUnit}
                />
            )}

            {/* Delete Unit Confirmation */}
            {unitToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Unit</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this unit? This will also remove any associated lease data.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setUnitToDelete(null)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleDeleteUnit(unitToDelete)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete Unit
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
