import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    Bell,
    FileText
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { propertyService } from '@/features/properties/propertyService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { UnitManagementDialog, UnitStatus } from '@/components/UnitManagementDialog';
import { DocumentList } from '@/components/documents/DocumentList';
import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog';
import { Document, documentService } from '@/api/documentService';

import { Property } from '@/types/property';

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
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [property, setProperty] = useState<Property | null>(null);
    const [units, setUnits] = useState<Unit[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showUnitDialog, setShowUnitDialog] = useState(false);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
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

            // Load documents for this property
            try {
                const docs = await documentService.getDocuments({ propertyId });
                setDocuments(docs);
            } catch (error) {
                console.error('Failed to load documents:', error);
            }
        } catch (error) {
            console.error('Failed to load property:', error);
            toast.error(t('propertyDetails.messages.loadError'));
            navigate('/dashboard/properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;

        try {
            await propertyService.deleteProperty(id);
            toast.success(t('propertyDetails.messages.deleteSuccess'));
            navigate('/dashboard/properties');
        } catch (error) {
            console.error('Failed to delete property:', error);
            toast.error(t('propertyDetails.messages.deleteError'));
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
            toast.success(t('propertyDetails.messages.unitDeleteSuccess'));
            if (id) {
                loadPropertyData(id);
            }
            setUnitToDelete(null);
        } catch (error) {
            console.error('Failed to delete unit:', error);
            toast.error(t('propertyDetails.messages.unitDeleteError'));
        }
    };

    const handleUnitSuccess = () => {
        if (id) {
            loadPropertyData(id);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{t('propertyDetails.loading')}</h2>
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
        <div className="min-h-screen bg-background pb-20">
            {/* Professional Sticky Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard/properties')}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{t('propertyDetails.title')}</h1>
                                <p className="text-sm text-muted-foreground">{t('propertyDetails.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <div className="h-8 w-px bg-border mx-1"></div>
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(true)}
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                            </Button>
                            <Button
                                onClick={() => navigate(`/dashboard/properties/${id}/edit`)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                {t('propertyDetails.editProperty')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-7xl mx-auto space-y-6">
                {/* Property Header Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Property Image */}
                        <div className="h-80 lg:h-full relative">
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-sm font-medium ${property.status === 'vacant' ? 'bg-emerald-500 text-white' :
                                property.status === 'occupied' ? 'bg-blue-500 text-white' :
                                    'bg-amber-500 text-white'
                                }`}>
                                {property.status === 'vacant' ? t('properties.available') : property.status === 'occupied' ? t('properties.occupied') : t('properties.maintenance')}
                            </div>
                        </div>

                        {/* Property Info */}
                        <div className="p-8">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-foreground">{property.title}</h1>
                                <p className="text-muted-foreground flex items-center gap-2">
                                    <MapPin className="w-5 h-5" />
                                    {property.address}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Bed className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('properties.beds')}</p>
                                        <p className="text-lg font-semibold text-foreground">{property.bedrooms}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                        <Bath className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('properties.baths')}</p>
                                        <p className="text-lg font-semibold text-foreground">{property.bathrooms}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                        <Ruler className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('properties.area')}</p>
                                        <p className="text-lg font-semibold text-foreground">{property.area}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                                        <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">{t('properties.rent')}</p>
                                        <p className="text-lg font-semibold text-foreground">${property.price.toLocaleString()}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                                    {property.type}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{t('propertyDetails.totalUnits')}</p>
                        <p className="text-3xl font-bold text-foreground">{units.length}</p>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{t('propertyDetails.occupancyRate')}</p>
                        <p className="text-3xl font-bold text-foreground">{occupancyRate}%</p>
                    </div>

                    <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{t('propertyDetails.totalMonthlyRent')}</p>
                        <p className="text-3xl font-bold text-foreground">${totalRent.toLocaleString()}</p>
                    </div>
                </div>

                {/* Units Section */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('propertyDetails.units')}</h3>
                        <Button size="sm" className="gap-2" onClick={handleAddUnit}>
                            <Plus className="w-4 h-4" />
                            {t('propertyDetails.addUnit')}
                        </Button>
                    </div>
                    <div className="p-6">
                        {units.length === 0 ? (
                            <div className="text-center py-12">
                                <Home className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">{t('propertyDetails.noUnits')}</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('propertyDetails.noUnitsDesc')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {units.map((unit) => (
                                    <div key={unit.id} className="border border-border rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group relative">
                                        <Link to={`/dashboard/units/${unit.id}`} className="absolute inset-0 z-0" />
                                        <div className="flex items-start justify-between mb-3 relative z-10 pointer-events-none">
                                            <div>
                                                <h4 className="font-semibold text-foreground">{t('propertyDetails.unit')} {unit.unitNumber}</h4>
                                                <p className="text-sm text-muted-foreground">{unit.sizeSqft ? `${unit.sizeSqft} ${t('propertyDetails.sqft')}` : 'N/A'}</p>
                                            </div>
                                            <div className="flex items-center gap-2 pointer-events-auto">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.status === 'OCCUPIED' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                    }`}>
                                                    {unit.status}
                                                </span>
                                                <button
                                                    onClick={() => handleEditUnit(unit)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-accent rounded transition-all"
                                                    title={t('propertyDetails.editUnit')}
                                                >
                                                    <Edit className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                                </button>
                                                <button
                                                    onClick={() => setUnitToDelete(unit.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                                                    title={t('propertyDetails.deleteUnit')}
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-muted-foreground">{t('propertyDetails.bedsBaths')}:</span>
                                                <span className="font-medium text-foreground">{unit.bedrooms}{t('propertyDetails.bd')} / {unit.bathrooms}{t('propertyDetails.ba')}</span>
                                            </div>
                                            {/* Rent amount removed as it's not in the model */}
                                            {unit.lease?.tenant && (
                                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                                    <span className="text-muted-foreground">{t('propertyDetails.tenant')}:</span>
                                                    <span className="font-medium text-foreground">{unit.lease.tenant.name}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Documents Section */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('propertyDetails.documents')}</h3>
                        <Button size="sm" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                            <Plus className="w-4 h-4" />
                            {t('propertyDetails.uploadDocument')}
                        </Button>
                    </div>
                    <div className="p-6">
                        <DocumentList
                            documents={documents}
                            onDocumentDeleted={() => id && loadPropertyData(id)}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{t('propertyDetails.deleteDialogTitle')}</h3>
                                <p className="text-sm text-muted-foreground">{t('propertyDetails.deleteDialogDesc')}</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            {t('propertyDetails.deleteConfirmation')} <strong>{property.title}</strong>{t('propertyDetails.deleteConfirmationSuffix')}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {t('propertyDetails.deleteProperty')}
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
                    <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">{t('propertyDetails.deleteUnitDialogTitle')}</h3>
                                <p className="text-sm text-muted-foreground">{t('propertyDetails.deleteDialogDesc')}</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            {t('propertyDetails.deleteUnitConfirmation')}
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setUnitToDelete(null)}
                                className="flex-1"
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={() => handleDeleteUnit(unitToDelete)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                {t('propertyDetails.deleteUnit')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Document Dialog */}
            <UploadDocumentDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                onDocumentUploaded={() => id && loadPropertyData(id)}
                propertyId={id}
            />
        </div>
    );
}
