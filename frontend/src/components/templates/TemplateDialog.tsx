import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
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
                toast.success(t('templates.dialog.successCreate'));
            }
            onOpenChange(false);
            onSave();
        } catch (error) {
            console.error('Failed to save template:', error);
            toast.error(t('templates.dialog.error'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? t('templates.dialog.editTitle') : t('templates.dialog.createTitle', { type: type.charAt(0) + type.slice(1).toLowerCase() })}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? t('templates.dialog.editSubtitle') : t('templates.dialog.createSubtitle', { type: type.toLowerCase() })}
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
                                        <FormLabel>{t('templates.dialog.name')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('templates.dialog.namePlaceholder')} {...field} />
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
                                        <FormLabel>{t('templates.dialog.category')}</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('templates.dialog.selectCategory')} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="general">{t('templates.dialog.categories.general')}</SelectItem>
                                                {type === 'EMAIL' && (
                                                    <>
                                                        <SelectItem value="rent_reminder">{t('templates.dialog.categories.rentReminder')}</SelectItem>
                                                        <SelectItem value="welcome">{t('templates.dialog.categories.welcome')}</SelectItem>
                                                        <SelectItem value="maintenance">{t('templates.dialog.categories.maintenance')}</SelectItem>
                                                    </>
                                                )}
                                                {type === 'AGREEMENT' && (
                                                    <>
                                                        <SelectItem value="lease">{t('templates.dialog.categories.lease')}</SelectItem>
                                                        <SelectItem value="addendum">{t('templates.dialog.categories.addendum')}</SelectItem>
                                                    </>
                                                )}
                                                {type === 'INVOICE' && (
                                                    <>
                                                        <SelectItem value="rent">{t('templates.dialog.categories.rent')}</SelectItem>
                                                        <SelectItem value="utility">{t('templates.dialog.categories.utility')}</SelectItem>
                                                        <SelectItem value="fee">{t('templates.dialog.categories.fee')}</SelectItem>
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
                                        <FormLabel>{t('templates.dialog.subject')}</FormLabel>
                                        <FormControl>
                                            <Input placeholder={t('templates.dialog.subjectPlaceholder')} {...field} />
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
                                            <FormLabel>{t('templates.dialog.content')}</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={t('templates.dialog.contentPlaceholder')}
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
                                <div className="rounded-lg border border-border bg-muted/50 p-4 h-full">
                                    <div className="mb-3">
                                        <p className="text-sm font-medium text-foreground">{t('templates.dialog.variables')}</p>
                                        <p className="text-xs text-muted-foreground">{t('templates.dialog.clickToCopy')}</p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        {VARIABLES_BY_TYPE[type].map((variable) => (
                                            <button
                                                key={variable.name}
                                                type="button"
                                                onClick={() => {
                                                    const text = `{{${variable.name}}}`;
                                                    navigator.clipboard.writeText(text);
                                                    toast.success(t('templates.dialog.copied', { text }));
                                                }}
                                                className="text-left group relative flex flex-col rounded-md border border-border bg-card px-3 py-2 text-xs hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                            >
                                                <code className="font-mono font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                                                    {`{{${variable.name}}}`}
                                                </code>
                                                <span className="text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400">
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
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>{t('templates.dialog.active')}</FormLabel>
                                        <FormDescription>
                                            {t('templates.dialog.available')}
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
                                {t('templates.dialog.cancel')}
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? t('templates.dialog.update') : t('templates.dialog.create')}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
