import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { FileText, Download, Eye, Loader2, Search, Filter, File, Image, Calendar } from 'lucide-react';
import { tenant } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

type DocumentType = 'ALL' | 'LEASE' | 'INVOICE' | 'NOTICE' | 'OTHER';

export function DocumentsPage() {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState<any[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<DocumentType>('ALL');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data } = await tenant.getDocuments();
        setDocuments(data);
        setFilteredDocuments(data);
      } catch (error) {
        console.error('Failed to fetch documents', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, [t]);

  useEffect(() => {
    let filtered = documents;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter(doc => doc.type === filterType);
    }

    setFilteredDocuments(filtered);
  }, [searchQuery, filterType, documents]);

  const getDocumentIcon = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('pdf') || typeLower === 'lease') {
      return <FileText className="h-8 w-8 text-red-600 dark:text-red-400" />;
    }
    if (typeLower.includes('image') || typeLower.includes('photo')) {
      return <Image className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
    }
    return <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
  };

  const getDocumentColor = (type: string) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('lease')) return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    if (typeLower.includes('invoice')) return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    if (typeLower.includes('notice')) return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
  };

  const handleDownload = async (doc: any) => {
    try {
      // In a real app, you'd trigger the download properly
      if (doc.url) {
        window.open(doc.url, '_blank');
        toast.success(t('documents.opening'));
      }
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">{t('documents.title')}</h1>
        <p className="text-muted-foreground dark:text-gray-400 mt-1">{t('documents.subtitle')}</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder={t('documents.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {(['ALL', 'LEASE', 'INVOICE', 'NOTICE', 'OTHER'] as DocumentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filterType === type
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              {type === 'ALL' ? t('documents.allDocuments') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      {filteredDocuments.length > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('documents.showing', { count: filteredDocuments.length, total: documents.length })}
        </div>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
              <File className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {searchQuery || filterType !== 'ALL' ? t('documents.noDocumentsFound') : t('documents.noDocuments')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
              {searchQuery || filterType !== 'ALL'
                ? t('documents.noDocumentsFoundDesc')
                : t('documents.noDocumentsDesc')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredDocuments.map((doc) => (
            <motion.div key={doc.id} variants={item}>
              <Card className={`flex flex-col h-full hover:shadow-lg transition-all duration-200 ${getDocumentColor(doc.type)}`}>
                <CardContent className="pt-6 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-shrink-0">
                      {getDocumentIcon(doc.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2 text-gray-900 dark:text-gray-100">{doc.title || 'Untitled Document'}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                        <Calendar className="h-3 w-3" />
                        <span>{t('documents.added', { date: new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) })}</span>
                      </div>
                      {doc.type && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 mt-2">
                          {doc.type}
                        </span>
                      )}
                      {doc.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">{doc.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <div className="p-4 bg-white/50 dark:bg-gray-800/50 border-t dark:border-gray-700 flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleDownload(doc)}
                  >
                    <Eye className="mr-2 h-4 w-4" /> {t('documents.view')}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => {
                      if (doc.url) {
                        const link = document.createElement('a');
                        link.href = doc.url;
                        link.download = doc.title || 'document';
                        link.click();
                        toast.success(t('documents.downloadStarted'));
                      }
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" /> {t('documents.save')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
