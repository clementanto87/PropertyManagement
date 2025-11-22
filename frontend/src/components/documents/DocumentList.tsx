
import { useState, useEffect } from 'react';
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
            setError('Failed to load documents');
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
        if (!confirm('Are you sure you want to delete this document?')) return;

        try {
            await documentService.deleteDocument(id);
            setDocuments(docs => docs.filter(d => d.id !== id));
            if (onDocumentDeleted) onDocumentDeleted();
        } catch (err) {
            alert('Failed to delete document');
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
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No documents yet</h3>
                <p className="text-gray-500 text-sm">Upload documents to keep them organized here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
                <div key={doc.id} className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 line-clamp-1" title={doc.title}>{doc.title}</h4>
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {doc.type}
                                </span>
                            </div>
                        </div>

                        <div className="relative">
                            <button
                                onClick={() => handleDelete(doc.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mt-4 pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                        </div>

                        <button
                            onClick={() => handleDownload(doc)}
                            className="flex items-center gap-1.5 text-blue-600 font-medium hover:text-blue-700"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
