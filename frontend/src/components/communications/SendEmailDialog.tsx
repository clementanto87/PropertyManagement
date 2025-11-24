import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
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
import { Checkbox } from '@/components/ui/checkbox';

import { emailTemplateService, type EmailTemplate } from '@/api/emailTemplateService';
import { communicationEmailService } from '@/api/communicationEmailService';
import { api } from '@/lib/api';

const sendEmailSchema = z.object({
    templateId: z.string().optional(),
    subject: z.string().min(1, 'Subject is required'),
    body: z.string().min(1, 'Message is required'),
    logAsCommunication: z.boolean().default(true),
});

type SendEmailFormValues = z.infer<typeof sendEmailSchema>;

interface SendEmailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenantId: string;
    tenantName: string;
    tenantEmail?: string;
    onEmailSent?: () => void;
}

export function SendEmailDialog({
    open,
    onOpenChange,
    tenantId,
    tenantName,
    tenantEmail,
    onEmailSent,
}: SendEmailDialogProps) {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const form = useForm<SendEmailFormValues>({
        resolver: zodResolver(sendEmailSchema) as any,
        defaultValues: {
            templateId: undefined,
            subject: '',
            body: '',
            logAsCommunication: true,
        },
    });

    // Load templates
    useEffect(() => {
        if (open) {
            loadTemplates();
        }
    }, [open]);

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const response = await emailTemplateService.getTemplates({ isActive: true });
            setTemplates(response.items);
        } catch (error) {
            console.error('Failed to load templates:', error);
            toast.error('Failed to load email templates');
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        const template = templates.find((t) => t.id === templateId);
        if (template) {
            form.setValue('subject', template.subject);
            form.setValue('body', template.body);
        }
    };

    const onSubmit = async (data: SendEmailFormValues) => {
        setIsSending(true);
        try {
            // Fetch tenant data to populate variables
            const tenant = await api.get<any>(`/tenants/${tenantId}`);

            // Build variables object from tenant data
            const variables: Record<string, string> = {
                tenantName: tenant.name || '',
                tenantEmail: tenant.email || '',
                tenantPhone: tenant.phone || '',
                propertyAddress: tenant.unit?.property?.address || '',
                unitNumber: tenant.unit?.unitNumber || '',
                leaseStartDate: tenant.lease?.startDate ? new Date(tenant.lease.startDate).toLocaleDateString() : '',
                leaseEndDate: tenant.lease?.endDate ? new Date(tenant.lease.endDate).toLocaleDateString() : '',
                rentAmount: tenant.lease?.rentAmount?.toString() || '',
                securityDeposit: tenant.lease?.securityDeposit?.toString() || '',
                // Add more common variables as needed
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 30 days from now
                amount: tenant.lease?.rentAmount?.toString() || '',
                inspectionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days from now
                depositReturnDays: '30',
            };

            await communicationEmailService.sendEmail({
                tenantId,
                templateId: data.templateId,
                subject: data.subject,
                body: data.body,
                variables, // Send variables for replacement
                logAsCommunication: data.logAsCommunication,
            });

            toast.success(`Email sent to ${tenantName}`);
            onOpenChange(false);
            form.reset();
            onEmailSent?.();
        } catch (error) {
            console.error('Failed to send email:', error);
            toast.error('Failed to send email');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Send Email to {tenantName}</DialogTitle>
                    <DialogDescription>
                        {tenantEmail ? `Sending to: ${tenantEmail}` : 'No email address on file'}
                    </DialogDescription>
                </DialogHeader>

                {!tenantEmail ? (
                    <div className="py-8 text-center">
                        <p className="text-sm text-gray-500">
                            This tenant does not have an email address on file.
                        </p>
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Template Selector */}
                            <FormField
                                control={form.control}
                                name="templateId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Template (Optional)</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value === 'none' ? undefined : value);
                                                if (value !== 'none') {
                                                    handleTemplateChange(value);
                                                }
                                            }}
                                            value={field.value || 'none'}
                                            disabled={isLoadingTemplates || isSending}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    {isLoadingTemplates ? (
                                                        <span className="flex items-center">
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Loading templates...
                                                        </span>
                                                    ) : (
                                                        <SelectValue placeholder="Choose a template or write custom email" />
                                                    )}
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">No template (Custom email)</SelectItem>
                                                {templates.map((template) => (
                                                    <SelectItem key={template.id} value={template.id}>
                                                        {template.name} - {template.category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            Select a template to auto-fill subject and body
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Subject */}
                            <FormField
                                control={form.control}
                                name="subject"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Email subject" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Body */}
                            <FormField
                                control={form.control}
                                name="body"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Message</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Email message..."
                                                className="min-h-[200px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Use variables like {'{'}{'{'} tenantName{'}'}{'}'}  for personalization
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Log as Communication */}
                            <FormField
                                control={form.control}
                                name="logAsCommunication"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Log as communication</FormLabel>
                                            <FormDescription>
                                                Save this email in the communication history
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => onOpenChange(false)}
                                    disabled={isSending}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSending}>
                                    {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Send className="mr-2 h-4 w-4" />
                                    Send Email
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
