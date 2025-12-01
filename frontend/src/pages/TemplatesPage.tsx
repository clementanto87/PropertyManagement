import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit, Trash2, FileText, Mail, Receipt, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { templateService, type Template, type TemplateType } from '@/api/templateService';
import { TemplateDialog } from '@/components/templates/TemplateDialog';
import { TemplatePreviewDialog } from '@/components/templates/TemplatePreviewDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export default function TemplatesPage() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TemplateType>('EMAIL');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Create/Edit Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

    // Delete Dialog State
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<Template | null>(null);

    // Preview Dialog State
    const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
    const [previewingTemplate, setPreviewingTemplate] = useState<Template | null>(null);

    useEffect(() => {
        loadTemplates();
    }, [activeTab]);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await templateService.getTemplates({ type: activeTab });
            setTemplates(response.items);
        } catch (error) {
            console.error('Failed to load templates:', error);
            toast.error(t('templates.messages.loadFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setDialogOpen(true);
    };

    const handleEdit = (template: Template) => {
        setEditingTemplate(template);
        setDialogOpen(true);
    };

    const handleDelete = (template: Template) => {
        setDeletingTemplate(template);
        setDeleteDialogOpen(true);
    };

    const handlePreview = (template: Template) => {
        setPreviewingTemplate(template);
        setPreviewDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTemplate) return;

        try {
            await templateService.deleteTemplate(deletingTemplate.id);
            toast.success(t('templates.messages.deleteSuccess'));
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            toast.error(t('templates.messages.deleteFailed'));
        } finally {
            setDeleteDialogOpen(false);
            setDeletingTemplate(null);
        }
    };

    const handleSave = async () => {
        setDialogOpen(false);
        setEditingTemplate(null);
        loadTemplates();
    };

    const filteredTemplates = templates.filter((template) =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="px-6 py-8 max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('templates.title')}</h1>
                            <p className="text-muted-foreground mt-1">
                                {t('templates.subtitle')}
                            </p>
                        </div>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            {t('templates.newTemplate')}
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TemplateType)} className="space-y-6">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="EMAIL" className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                {t('templates.tabs.emails')}
                            </TabsTrigger>
                            <TabsTrigger value="AGREEMENT" className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                {t('templates.tabs.agreements')}
                            </TabsTrigger>
                            <TabsTrigger value="INVOICE" className="flex items-center gap-2">
                                <Receipt className="h-4 w-4" />
                                {t('templates.tabs.invoices')}
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('templates.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <TabsContent value={activeTab} className="mt-0">
                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-48 bg-muted rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredTemplates.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <p className="text-muted-foreground">
                                            {t('templates.empty.message', { type: activeTab.toLowerCase() })}
                                        </p>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTemplates.map((template) => (
                                        <Card key={template.id} className="hover:shadow-md transition-shadow group">
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <CardTitle className="text-lg font-semibold text-foreground">{template.name}</CardTitle>
                                                        <Badge variant="secondary" className="mt-2 capitalize">
                                                            {template.category.replace(/_/g, ' ')}
                                                        </Badge>
                                                    </div>
                                                    {!template.isActive && (
                                                        <Badge variant="outline" className="ml-2 text-muted-foreground">
                                                            {t('templates.labels.inactive')}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {template.subject && (
                                                        <div>
                                                            <p className="text-xs font-medium text-muted-foreground uppercase">{t('templates.labels.subject')}</p>
                                                            <p className="text-sm truncate text-foreground">{template.subject}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-xs font-medium text-muted-foreground uppercase">{t('templates.labels.preview')}</p>
                                                        <p className="text-sm text-muted-foreground line-clamp-3 font-mono bg-muted p-2 rounded mt-1 text-xs">
                                                            {template.body}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handlePreview(template)}
                                                        >
                                                            <Eye className="mr-2 h-3 w-3" />
                                                            {t('templates.actions.preview')}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1"
                                                            onClick={() => handleEdit(template)}
                                                        >
                                                            <Edit className="mr-2 h-3 w-3" />
                                                            {t('templates.actions.edit')}
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(template)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <TemplateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                template={editingTemplate}
                type={activeTab}
                onSave={handleSave}
            />

            <TemplatePreviewDialog
                open={previewDialogOpen}
                onOpenChange={setPreviewDialogOpen}
                template={previewingTemplate}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title={t('templates.delete.title')}
                description={t('templates.delete.description', { name: deletingTemplate?.name || '' })}
            />
        </div>
    );
}
