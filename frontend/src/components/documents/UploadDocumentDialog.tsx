import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select-component';
import { documentService } from '@/api/documentService';
import { toast } from 'sonner';

const uploadSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.string().min(1, 'Type is required'),
    file: z.any().refine((file) => file instanceof File, 'File is required'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

type UploadDocumentDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onDocumentUploaded: () => void;
    propertyId?: string;
    tenantId?: string;
    leaseId?: string;
    unitId?: string;
};

export function UploadDocumentDialog({
    open,
    onOpenChange,
    onDocumentUploaded,
    propertyId,
    tenantId,
    leaseId,
    unitId,
}: UploadDocumentDialogProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<UploadFormValues>({
        resolver: zodResolver(uploadSchema),
        defaultValues: {
            title: '',
            type: 'OTHER',
        },
    });

    const onSubmit = async (data: UploadFormValues) => {
        setIsUploading(true);
        try {
            await documentService.createDocument({
                title: data.title,
                type: data.type,
                url: '', // Not used for upload
                file: data.file,
                propertyId,
                leaseId,
                unitId,
            });

            toast.success('Document uploaded successfully');
            form.reset();
            onOpenChange(false);
            onDocumentUploaded();
        } catch (error) {
            console.error('Error uploading document:', error);
            toast.error('Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                    <DialogDescription>
                        Upload a document (PDF, image, etc.) to attach to this record.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Lease Agreement" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="LEASE">Lease Agreement</SelectItem>
                                            <SelectItem value="RECEIPT">Receipt</SelectItem>
                                            <SelectItem value="INVOICE">Invoice</SelectItem>
                                            <SelectItem value="INSPECTION">Inspection Report</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="file"
                            render={({ field: { onChange, value, ...field } }) => (
                                <FormItem>
                                    <FormLabel>File</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) onChange(file);
                                                }}
                                                {...field}
                                            />
                                            <Upload className="h-5 w-5 text-gray-400" />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isUploading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Upload
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
