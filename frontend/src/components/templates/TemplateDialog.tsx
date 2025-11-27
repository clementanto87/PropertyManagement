import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
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
    FormDescription,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select-component';
import { templateService, type Template, type TemplateType } from '@/api/templateService';

const VARIABLES_BY_TYPE: Record<TemplateType, { name: string; description: string }[]> = {
    EMAIL: [
        { name: 'tenantName', description: 'Full Name' },
        { name: 'tenantEmail', description: 'Email Address' },
        { name: 'propertyName', description: 'Property Name' },
        { name: 'unitNumber', description: 'Unit Number' },
        { name: 'dueDate', description: 'Due Date' },
        { name: 'amount', description: 'Amount' },
    ],
    AGREEMENT: [
        { name: 'tenantName', description: 'Tenant Name' },
        { name: 'landlordName', description: 'Landlord Name' },
        { name: 'propertyAddress', description: 'Property Address' },
        { name: 'leaseStartDate', description: 'Start Date' },
        { name: 'leaseEndDate', description: 'End Date' },
        { name: 'rentAmount', description: 'Rent Amount' },
        { name: 'securityDeposit', description: 'Security Deposit' },
    ],
    INVOICE: [
        { name: 'invoiceNumber', description: 'Invoice #' },
        { name: 'tenantName', description: 'Tenant Name' },
        { name: 'propertyName', description: 'Property Name' },
        { name: 'unitNumber', description: 'Unit Number' },
        { name: 'issueDate', description: 'Issue Date' },
        { name: 'dueDate', description: 'Due Date' },
        { name: 'totalAmount', description: 'Total Amount' },
        { name: 'items', description: 'Line Items Table' },
    ],
};

const templateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    subject: z.string().optional(),
    body: z.string().min(1, 'Body is required'),
    isActive: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface TemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template | null;
    type: TemplateType;
    onSave: () => void;
}

export function TemplateDialog({ open, onOpenChange, template, type, onSave }: TemplateDialogProps) {
    const [isSaving, setIsSaving] = useState(false);
    const isEdit = Boolean(template);

    const form = useForm<TemplateFormValues>({
        resolver: zodResolver(templateSchema) as any,
        defaultValues: {
            name: '',
            category: 'general',
            subject: '',
            body: '',
            isActive: true,
        },
    });

    useEffect(() => {
        if (template) {
            form.reset({
                name: template.name,
                category: template.category,
                subject: template.subject || '',
                body: template.body,
                isActive: template.isActive,
            });
        } else {
            form.reset({
                name: '',
                category: 'general',
                subject: '',
                body: '',
                isActive: true,
            });
        }
    }, [template, form]);

    const onSubmit = async (data: TemplateFormValues) => {
        setIsSaving(true);
        try {
            if (isEdit && template) {
                await templateService.updateTemplate(template.id, {
                    ...data,
                    type,
                    variables: template.variables || {},
                });
                toast.success('Template updated successfully');
            } else {
                await templateService.createTemplate({
                    ...data,
                    type,
                    variables: {},
                });
                toast.success('Template created successfully');
            }
            onOpenChange(false);
            onSave();
        } catch (error) {
            console.error('Failed to save template:', error);
            toast.error('Failed to save template');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Template' : `Create ${type.charAt(0) + type.slice(1).toLowerCase()} Template`}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the template details' : `Create a new ${type.toLowerCase()} template`}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Template Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Standard Lease Agreement" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">General</SelectItem>
                                                {type === 'EMAIL' && (
                                                    <>
                                                        <SelectItem value="rent_reminder">Rent Reminder</SelectItem>
                                                        <SelectItem value="welcome">Welcome</SelectItem>
                                                        <SelectItem value="maintenance">Maintenance</SelectItem>
                                                    </>
                                                )}
                                                {type === 'AGREEMENT' && (
                                                    <>
                                                        <SelectItem value="lease">Lease</SelectItem>
                                                        <SelectItem value="addendum">Addendum</SelectItem>
                                                    </>
                                                )}
                                                {type === 'INVOICE' && (
                                                    <>
                                                        <SelectItem value="rent">Rent</SelectItem>
                                                        <SelectItem value="utility">Utility</SelectItem>
                                                        <SelectItem value="fee">Fee</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {type === 'EMAIL' && (
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Line</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email Subject" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="body"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Template Content</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Template content..."
                                                    className="min-h-[400px] font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Use {'{{'} and {'}}'} for variables.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="col-span-1">
                                <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 h-full">
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-gray-900">Variables</p>
                                        <p className="text-xs text-gray-500">Click to copy</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {VARIABLES_BY_TYPE[type].map((variable) => (
                                            <button
                                                key={variable.name}
                                                type="button"
                                                onClick={() => {
                                                    const text = `{{${variable.name}}}`;
                                                    navigator.clipboard.writeText(text);
                                                    toast.success(`Copied ${text}`);
                                                }}
                                                className="text-left group relative flex flex-col rounded-md border border-gray-200 bg-white px-3 py-2 text-xs hover:border-blue-300 hover:bg-blue-50 transition-colors"
                                            >
                                                <code className="font-mono font-semibold text-blue-600 group-hover:text-blue-700">
                                                    {`{{${variable.name}}}`}
                                                </code>
                                                <span className="text-gray-500 group-hover:text-blue-600">
                                                    {variable.description}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Active Template</FormLabel>
                                        <FormDescription>
                                            Available for use
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Update' : 'Create'} Template
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
