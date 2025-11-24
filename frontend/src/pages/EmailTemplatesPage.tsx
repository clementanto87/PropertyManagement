import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { emailTemplateService, type EmailTemplate } from '@/api/emailTemplateService';
import { EmailTemplateDialog } from '@/components/email-templates/EmailTemplateDialog';
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';

export default function EmailTemplatesPage() {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setIsLoading(true);
        try {
            const response = await emailTemplateService.getTemplates({});
            setTemplates(response.items);
        } catch (error) {
            console.error('Failed to load templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNew = () => {
        setEditingTemplate(null);
        setDialogOpen(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setDialogOpen(true);
    };

    const handleDelete = (template: EmailTemplate) => {
        setDeletingTemplate(template);
        setDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingTemplate) return;

        try {
            await emailTemplateService.deleteTemplate(deletingTemplate.id);
            toast.success('Template deleted successfully');
            loadTemplates();
        } catch (error) {
            console.error('Failed to delete template:', error);
            toast.error('Failed to delete template');
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

    const filteredTemplates = templates.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.category.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...Array.from(new Set(templates.map((t) => t.category)))];

    const getCategoryColor = (category: string) => {
        const colors: Record<string, string> = {
            rent_reminder: 'bg-blue-100 text-blue-700',
            welcome: 'bg-green-100 text-green-700',
            maintenance: 'bg-orange-100 text-orange-700',
            lease_renewal: 'bg-purple-100 text-purple-700',
            move_out: 'bg-red-100 text-red-700',
        };
        return colors[category] || 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            <div className="px-6 py-8 max-w-7xl mx-auto">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
                            <p className="text-muted-foreground mt-1">
                                Manage email templates for tenant communications
                            </p>
                        </div>
                        <Button onClick={handleCreateNew}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Template
                        </Button>
                    </div>

                    {/* Filters */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search templates..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {categories.map((category) => (
                                        <Button
                                            key={category}
                                            variant={selectedCategory === category ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setSelectedCategory(category)}
                                        >
                                            {category === 'all' ? 'All' : category.replace(/_/g, ' ')}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Templates List */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <p className="text-muted-foreground">
                                    {searchQuery || selectedCategory !== 'all'
                                        ? 'No templates match your filters'
                                        : 'No email templates yet. Create your first template!'}
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTemplates.map((template) => (
                                <Card key={template.id} className="hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{template.name}</CardTitle>
                                                <Badge className={`mt-2 ${getCategoryColor(template.category)}`}>
                                                    {template.category.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                            {!template.isActive && (
                                                <Badge variant="outline" className="ml-2">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Subject:</p>
                                                <p className="text-sm line-clamp-2">{template.subject}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Preview:</p>
                                                <p className="text-sm text-gray-600 line-clamp-3">{template.body}</p>
                                            </div>
                                            <div className="flex gap-2 pt-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex-1"
                                                    onClick={() => handleEdit(template)}
                                                >
                                                    <Edit className="mr-2 h-3 w-3" />
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                </div>
            </div>

            {/* Dialogs */}
            <EmailTemplateDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                template={editingTemplate}
                onSave={handleSave}
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={confirmDelete}
                title="Delete Email Template"
                description={`Are you sure you want to delete "${deletingTemplate?.name}"? This action cannot be undone.`}
            />
        </div>
    );
}
