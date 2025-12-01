import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Download, Trash2, Calendar } from 'lucide-react';
import { documentService, type Document } from '@/api/documentService';
import { format } from 'date-fns';

interface DocumentListProps {
    propertyId?: string;
    leaseId?: string;
    tenantId?: string;
    unitId?: string;
    refreshTrigger?: number; // Prop to trigger refresh from parent
    documents?: Document[]; // Allow passing documents directly
    onDocumentDeleted?: () => void; // Callback for deletion
}

export function DocumentList({ propertyId, leaseId, tenantId, unitId, refreshTrigger, documents: initialDocuments, onDocumentDeleted }: DocumentListProps) {
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<Document[]>(initialDocuments || []);
    const [loading, setLoading] = useState(!initialDocuments);
    const [error, setError] = useState<string | null>(null);

    const fetchDocuments = async () => {
        if (initialDocuments) {
            setDocuments(initialDocuments);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await documentService.getDocuments({ propertyId, leaseId, tenantId, unitId });
            setDocuments(data);
            setError(null);
        } catch (err) {
            setError(t('documents.messages.loadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [propertyId, leaseId, tenantId, unitId, refreshTrigger, initialDocuments]);

    const handleDownload = (doc: Document) => {
        // Open in new tab which triggers download/view
        window.open(documentService.getDownloadUrl(doc.id), '_blank');
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('documents.deleteConfirmation'))) return;

        try {
            await documentService.deleteDocument(id);
            setDocuments(docs => docs.filter(d => d.id !== id));
            if (onDocumentDeleted) onDocumentDeleted();
        } catch (err) {
            alert(t('documents.messages.deleteError'));
        }
    };

    if (loading && documents.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-500 bg-red-50 rounded-xl border border-red-100">
                {error}
            </div>
        );
    }

    if (documents.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-gray-900 dark:text-gray-100 font-medium mb-1">{t('documents.noDocuments')}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{t('documents.noDocumentsDesc')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <div key={doc.id} className="group bg-white dark:bg-card p-4 rounded-xl border border-gray-200 dark:border-border hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-foreground line-clamp-1" title={doc.title}>{doc.title}</h4>
                                <span className="text-xs font-medium text-gray-500 dark:text-muted-foreground bg-gray-100 dark:bg-secondary px-2 py-0.5 rounded-full">
                                    {doc.type}
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title={t('documents.delete')}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-muted-foreground mt-4 pt-3 border-t border-gray-50 dark:border-border">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                        </div>

                        <button
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-700 dark:hover:text-blue-300"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {t('documents.download')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
