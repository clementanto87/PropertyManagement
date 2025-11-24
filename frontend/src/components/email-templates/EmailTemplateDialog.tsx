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
import { emailTemplateService, type EmailTemplate } from '@/api/emailTemplateService';

const AVAILABLE_VARIABLES = [
    { name: 'tenantName', description: 'Full Name' },
    { name: 'tenantEmail', description: 'Email Address' },
    { name: 'tenantPhone', description: 'Phone Number' },
    { name: 'propertyName', description: 'Property Name' },
    { name: 'propertyAddress', description: 'Property Address' },
    { name: 'unitNumber', description: 'Unit Number' },
    { name: 'leaseStartDate', description: 'Lease Start' },
    { name: 'leaseEndDate', description: 'Lease End' },
    { name: 'rentAmount', description: 'Monthly Rent' },
    { name: 'securityDeposit', description: 'Security Deposit' },
    { name: 'dueDate', description: 'Payment Due Date' },
    { name: 'amount', description: 'Payment Amount' },
    { name: 'inspectionDate', description: 'Inspection Date' },
    { name: 'depositReturnDays', description: 'Return Days' },
];

const templateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Body is required'),
    isActive: z.boolean().default(true),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface EmailTemplateDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: EmailTemplate | null;
    onSave: () => void;
}

export function EmailTemplateDialog({ open, onOpenChange, template, onSave }: EmailTemplateDialogProps) {
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
                subject: template.subject,
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
                await emailTemplateService.updateTemplate(template.id, {
                    ...data,
                    category: data.category as any,
                    variables: template.variables || {},
                });
                toast.success('Template updated successfully');
            } else {
                await emailTemplateService.createTemplate({
                    ...data,
                    category: data.category as any,
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Template' : 'Create Template'}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? 'Update the email template details' : 'Create a new email template for tenant communications'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Template Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Monthly Rent Reminder" {...field} />
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
                                            <SelectItem value="rent_reminder">Rent Reminder</SelectItem>
                                            <SelectItem value="welcome">Welcome</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="lease_renewal">Lease Renewal</SelectItem>
                                            <SelectItem value="move_out">Move Out</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject Line</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Rent Payment Due - {{dueDate}}" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Use {'{{'} and {'}}'}  for variables (e.g., {'{{'} tenantName {'}}'})
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email Body</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Dear {{tenantName}},&#10;&#10;This is a reminder that..."
                                            className="min-h-[200px] font-mono text-sm"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Use {'{{'} and {'}}'}  for variables. Use \n for line breaks.
                                    </FormDescription>

                                    <div className="mt-2 rounded-md bg-gray-50 p-3 text-xs">
                                        <p className="mb-2 font-medium text-gray-700">Available Variables:</p>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                                            {AVAILABLE_VARIABLES.map((variable) => (
                                                <div key={variable.name} className="group flex items-center gap-1.5">
                                                    <code className="rounded bg-gray-200 px-1 py-0.5 font-mono text-gray-800">
                                                        {`{{${variable.name}}}`}
                                                    </code>
                                                    <span className="text-gray-500 truncate" title={variable.description}>
                                                        - {variable.description}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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
                                            Only active templates will be available for selection when sending emails
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
