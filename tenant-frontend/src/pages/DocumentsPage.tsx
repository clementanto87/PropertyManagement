import { useEffect, useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Eye, Loader2 } from 'lucide-react';
import { tenant } from '../services/api';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await tenant.getDocuments();
        setDocuments(data);
      } catch (error) {
        console.error('Failed to fetch documents', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Documents</h1>
        <p className="text-muted-foreground mt-1">Access your lease agreements and other important files.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No documents found.
          </div>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="flex flex-col">
              <CardContent className="pt-6 flex-1">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{doc.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Added {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-2">
                      {doc.type || 'Document'}
                    </span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 bg-gray-50 border-t flex gap-2">
                <Button variant="outline" className="flex-1" size="sm" asChild>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <Eye className="mr-2 h-4 w-4" /> View
                  </a>
                </Button>
                <Button variant="outline" className="flex-1" size="sm" asChild>
                  <a href={doc.url} download>
                    <Download className="mr-2 h-4 w-4" /> Save
                  </a>
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
