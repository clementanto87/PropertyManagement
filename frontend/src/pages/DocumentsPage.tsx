import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getAuthToken } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select-component';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu';
import { FileText, Download, Trash2, Upload, Search, File, FileCode, FileSpreadsheet, FileImage, LayoutGrid, List, Filter, ArrowUpDown, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Document {
    id: string;
    title: string;
    type: string;
    url: string;
    createdAt: string;
    property?: { name: string };
    unit?: { unitNumber: string };
    lease?: { tenant: { name: string } };
}

interface Property {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    unitNumber: string;
    propertyId: string;
}

type ViewMode = 'grid' | 'list';
type SortOrder = 'newest' | 'oldest' | 'a-z' | 'z-a';

export default function DocumentsPage() {
    const queryClient = useQueryClient();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadType, setUploadType] = useState('document');
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

    // Fetch documents
    const { data: documents, isLoading } = useQuery({
        queryKey: ['documents', searchQuery],
        queryFn: async () => {
            const searchParams = new URLSearchParams();
            if (searchQuery) searchParams.append('search', searchQuery);

            const queryString = searchParams.toString();
            const url = queryString ? `/documents?${queryString}` : '/documents';

            const response = await api.get<{ items: Document[] }>(url);
            return response.items;
        },
    });

    // Fetch properties
    const { data: properties } = useQuery({
        queryKey: ['properties'],
        queryFn: async () => {
            const response = await api.get<{ items: Property[] }>('/properties');
            return response.items;
        },
    });

    // Fetch units (filtered by property if selected)
    const { data: units } = useQuery({
        queryKey: ['units', selectedPropertyId],
        queryFn: async () => {
            const url = selectedPropertyId ? `/units?propertyId=${selectedPropertyId}` : '/units';
            const response = await api.get<{ items: Unit[] }>(url);
            return response.items;
        },
        enabled: true, // Always fetch, or conditionally if needed
    });

    // Client-side sorting
    const sortedDocuments = React.useMemo(() => {
        if (!documents) return [];

        return [...documents].sort((a, b) => {
            switch (sortOrder) {
                case 'newest':
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'a-z':
                    return a.title.localeCompare(b.title);
                case 'z-a':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });
    }, [documents, sortOrder]);

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            setIsUploadOpen(false);
            setUploadFile(null);
            setUploadTitle('');
            setSelectedPropertyId('');
            setSelectedUnitId('');
            toast.success('Document uploaded successfully');
        },
        onError: () => {
            toast.error('Failed to upload document');
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            return api.delete(`/documents/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success('Document deleted successfully');
        },
        onError: () => {
            toast.error('Failed to delete document');
        },
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle) return;

        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('title', uploadTitle);
        formData.append('type', uploadType);
        if (selectedPropertyId && selectedPropertyId !== 'none') formData.append('propertyId', selectedPropertyId);
        if (selectedUnitId && selectedUnitId !== 'none') formData.append('unitId', selectedUnitId);

        uploadMutation.mutate(formData);
    };

    const handleDownload = async (doc: Document) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'}/documents/${doc.id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${doc.title}.${doc.url.split('.').pop()}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleView = async (doc: Document) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'}/documents/${doc.id}/download`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to load document');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            // Clean up the URL object after a short delay to allow the new tab to load it
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            toast.error('Failed to view document');
        }
    };

    const getFileIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'contract': return <FileText className="h-8 w-8 text-blue-500" />;
            case 'invoice': return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
            case 'image': return <FileImage className="h-8 w-8 text-purple-500" />;
            default: return <File className="h-8 w-8 text-gray-500" />;
        }
    };

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
                    <p className="text-muted-foreground">Manage and organize your property documents.</p>
                </div>

                <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Upload New Document</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="Document Title"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select value={uploadType} onValueChange={setUploadType}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="document">Document</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="invoice">Invoice</SelectItem>
                                        <SelectItem value="manual">Manual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="property">Property (Optional)</Label>
                                    <Select value={selectedPropertyId} onValueChange={(val) => {
                                        setSelectedPropertyId(val);
                                        setSelectedUnitId(''); // Reset unit when property changes
                                    }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Property" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {properties?.map((prop) => (
                                                <SelectItem key={prop.id} value={prop.id}>{prop.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unit (Optional)</Label>
                                    <Select value={selectedUnitId} onValueChange={setSelectedUnitId} disabled={!selectedPropertyId || selectedPropertyId === 'none'}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {units?.map((unit) => (
                                                <SelectItem key={unit.id} value={unit.id}>{unit.unitNumber}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="file">File</Label>
                                <Input
                                    id="file"
                                    type="file"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={uploadMutation.isPending}>
                                {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Professional Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-2 rounded-lg border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search documents by name, type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto border-t md:border-t-0 md:border-l pt-2 md:pt-0 md:pl-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>All Documents</DropdownMenuItem>
                            <DropdownMenuItem>Contracts</DropdownMenuItem>
                            <DropdownMenuItem>Invoices</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowUpDown className="h-4 w-4" />
                                Sort
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSortOrder('newest')}>
                                Newest First {sortOrder === 'newest' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder('oldest')}>
                                Oldest First {sortOrder === 'oldest' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder('a-z')}>
                                Name (A-Z) {sortOrder === 'a-z' && '✓'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSortOrder('z-a')}>
                                Name (Z-A) {sortOrder === 'z-a' && '✓'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="flex items-center bg-muted/50 rounded-md p-1 ml-2">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse h-40" />
                    ))}
                </div>
            ) : sortedDocuments.length === 0 ? (
                <div className="text-center py-12">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                        <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium">No documents found</h3>
                    <p className="text-muted-foreground mt-1">Try adjusting your search or upload a new document.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedDocuments.map((doc) => (
                        <Card key={doc.id} className="group hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-semibold line-clamp-1" title={doc.title}>
                                            {doc.title}
                                        </CardTitle>
                                        <CardDescription className="text-xs capitalize">
                                            {doc.type} • {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {doc.property && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-xs uppercase tracking-wider text-gray-500">Property</span>
                                            <span className="truncate" title={doc.property.name}>{doc.property.name}</span>
                                        </div>
                                    )}
                                    {doc.unit && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-xs uppercase tracking-wider text-gray-500">Unit</span>
                                            <span>{doc.unit.unitNumber}</span>
                                        </div>
                                    )}
                                    {doc.lease && (
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-xs uppercase tracking-wider text-gray-500">Tenant</span>
                                            <span className="truncate">{doc.lease.tenant.name}</span>
                                        </div>
                                    )}
                                    {!doc.property && !doc.unit && !doc.lease && (
                                        <span className="italic text-gray-400">General Document</span>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-2 border-t bg-gray-50/50 dark:bg-gray-900/50">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-blue-600" onClick={() => handleView(doc)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-blue-600" onClick={() => handleDownload(doc)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:text-red-600" onClick={() => deleteMutation.mutate(doc.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Related To</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedDocuments.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(doc.type)}
                                            {doc.title}
                                        </div>
                                    </TableCell>
                                    <TableCell className="capitalize">{doc.type}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm text-muted-foreground">
                                            {doc.property && <span>{doc.property.name}</span>}
                                            {doc.unit && <span>Unit {doc.unit.unitNumber}</span>}
                                            {doc.lease && <span>{doc.lease.tenant.name}</span>}
                                            {!doc.property && !doc.unit && !doc.lease && <span className="italic">General</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="sm" onClick={() => handleView(doc)}>
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(doc.id)}>
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
