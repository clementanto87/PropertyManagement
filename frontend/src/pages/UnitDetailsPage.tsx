import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
            <div className="flex justify-center items-center min-h-screen bg-background">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!unit) {
        return <div className="text-foreground p-8">{t('unitDetails.notFound')}</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background min-h-screen">
            <Button
                variant="ghost"
                className="mb-6 pl-0 hover:pl-2 transition-all text-muted-foreground hover:text-foreground"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('unitDetails.back')}
            </Button>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{t('unitDetails.title')} {unit.unitNumber}</h1>
                    <div className="flex items-center text-muted-foreground">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span>{unit.property.name}</span>
                        <span className="mx-2">•</span>
                        <span>{unit.property.address}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${unit.status === 'OCCUPIED' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                        unit.status === 'VACANT' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                        }`}>
                        {unit.status === 'OCCUPIED' ? t('unitDetails.status.occupied') :
                            unit.status === 'VACANT' ? t('unitDetails.status.vacant') :
                                t('unitDetails.status.maintenance')}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <BedDouble className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{t('unitDetails.bedrooms')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{unit.bedrooms}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Bath className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{t('unitDetails.bathrooms')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{unit.bathrooms}</p>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Ruler className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground">{t('unitDetails.size')}</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{unit.sizeSqft ? `${unit.sizeSqft} ${t('unitDetails.sqft')}` : '-'}</p>
                </div>
            </div>

            <Tabs defaultValue="documents" className="space-y-6">
                <TabsList className="bg-muted">
                    <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-card data-[state=active]:text-foreground">
                        <FileText className="w-4 h-4" />
                        {t('unitDetails.documents')}
                    </TabsTrigger>
                    {/* Add more tabs like Maintenance, Leases later */}
                </TabsList>

                <TabsContent value="documents" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-foreground">{t('unitDetails.unitDocuments')}</h3>
                            <p className="text-sm text-muted-foreground">{t('unitDetails.documentsDesc')}</p>
                        </div>
                        <Button onClick={() => setIsUploadOpen(true)}>
                            {t('unitDetails.uploadDocument')}
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
