import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, BedDouble, Bath, Ruler, FileText } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentList } from '@/components/documents/DocumentList';
import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog';

type Unit = {
    id: string;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    sizeSqft?: number;
    status: string;
    propertyId: string;
    property: {
        name: string;
        address: string;
    };
};

export default function UnitDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [unit, setUnit] = useState<Unit | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const data = await api.get<Unit>(`/units/${id}`);
                setUnit(data);
            } catch (err) {
                console.error('Failed to load unit', err);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!unit) {
        return <div>Unit not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Unit {unit.unitNumber}</h1>
                    <div className="flex items-center text-gray-500">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{unit.property.name}</span>
                        <span className="mx-2">•</span>
                        <span>{unit.property.address}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${unit.status === 'OCCUPIED' ? 'bg-green-100 text-green-700' :
                            unit.status === 'VACANT' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                        }`}>
                        {unit.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <BedDouble className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Bedrooms</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{unit.bedrooms}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Bath className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Bathrooms</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{unit.bathrooms}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Ruler className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-gray-500">Size</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{unit.sizeSqft ? `${unit.sizeSqft} sqft` : '-'}</p>
                </div>
            </div>

            <Tabs defaultValue="documents" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="documents" className="gap-2">
                        <FileText className="w-4 h-4" />
                        Documents
                    </TabsTrigger>
                    {/* Add more tabs like Maintenance, Leases later */}
                </TabsList>

                <TabsContent value="documents" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Unit Documents</h3>
                            <p className="text-sm text-gray-500">Manage documents specific to this unit (manuals, warranties, etc.)</p>
                        </div>
                        <Button onClick={() => setIsUploadOpen(true)}>
                            Upload Document
                        </Button>
                    </div>

                    <DocumentList
                        unitId={unit.id} // Pass unitId instead of propertyId
                        refreshTrigger={refreshTrigger}
                    />
                </TabsContent>
            </Tabs>

            <UploadDocumentDialog
                open={isUploadOpen}
                onOpenChange={setIsUploadOpen}
                onDocumentUploaded={() => setRefreshTrigger(prev => prev + 1)}
                unitId={unit.id} // Pass unitId
                propertyId={unit.propertyId} // Also pass propertyId for context if needed
            />
        </div>
    );
}
