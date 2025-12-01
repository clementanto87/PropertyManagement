import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { type Template } from '@/api/templateService';

interface TemplatePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template | null;
}

// DUMMY_DATA moved inside component to support i18n

export function TemplatePreviewDialog({ open, onOpenChange, template }: TemplatePreviewDialogProps) {
    const { t, i18n } = useTranslation();

    if (!template) return null;

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat(i18n.language, {
            style: 'currency',
            currency: 'USD', // Assuming USD for now, could be dynamic
        }).format(amount);
    };

    // Helper to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(i18n.language).format(date);
    };

    const DUMMY_DATA: Record<string, string> = {
        // Tenant
        tenantName: 'John Doe',
        tenantEmail: 'john.doe@example.com',
        tenantPhone: '(555) 123-4567',

        // Landlord
        landlordName: 'Acme Property Management',

        // Property
        propertyName: 'Sunset Apartments',
        propertyAddress: '123 Sunset Blvd, Los Angeles, CA 90028',
        unitNumber: '4B',

        // Lease
        leaseStartDate: formatDate('2024-01-01'),
        leaseEndDate: formatDate('2024-12-31'),
        rentAmount: formatCurrency(2500),
        securityDeposit: formatCurrency(2500),

        // Invoice
        invoiceNumber: 'INV-2024-001',
        issueDate: formatDate('2024-11-01'),
        dueDate: formatDate('2024-11-05'),
        totalAmount: formatCurrency(2500),
        items: `
| ${t('templates.preview.description')} | ${t('templates.preview.amount')} |
|-------------|--------|
| ${t('templates.preview.monthlyRent')} | ${formatCurrency(2500)} |
        `,

        // Dates
        inspectionDate: formatDate('2024-11-15'),
        depositReturnDays: '21',
    };

    const processTemplate = (content: string) => {
        let processed = content;
        Object.entries(DUMMY_DATA).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            processed = processed.replace(regex, value);
        });
        return processed;
    };

    const processedBody = processTemplate(template.body);
    const processedSubject = template.subject ? processTemplate(template.subject) : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t('templates.preview.title', { name: template.name })}</DialogTitle>
                    <DialogDescription>
                        {t('templates.preview.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                    <div className="space-y-6 py-4">
                        {template.type === 'EMAIL' && processedSubject && (
                            <div className="border-b border-border pb-4">
                                <span className="text-sm font-medium text-muted-foreground">{t('templates.preview.subject')}</span>
                                <p className="text-lg font-medium mt-1 text-foreground">{processedSubject}</p>
                            </div>
                        )}

                        <div className="bg-muted/50 p-6 rounded-lg border border-border min-h-[300px]">
                            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-mono text-sm text-foreground">
                                {processedBody}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-auto">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('templates.preview.closePreview')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
