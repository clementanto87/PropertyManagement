import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { type Template } from '@/api/templateService';

interface TemplatePreviewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: Template | null;
}

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
    leaseStartDate: '01/01/2024',
    leaseEndDate: '12/31/2024',
    rentAmount: '$2,500.00',
    securityDeposit: '$2,500.00',

    // Invoice
    invoiceNumber: 'INV-2024-001',
    issueDate: '11/01/2024',
    dueDate: '11/05/2024',
    totalAmount: '$2,500.00',
    items: `
| Description | Amount |
|-------------|--------|
| Monthly Rent | $2,500.00 |
    `,

    // Dates
    inspectionDate: '11/15/2024',
    depositReturnDays: '21',
};

export function TemplatePreviewDialog({ open, onOpenChange, template }: TemplatePreviewDialogProps) {
    if (!template) return null;

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
                    <DialogTitle>Preview: {template.name}</DialogTitle>
                    <DialogDescription>
                        Previewing with sample data
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-4 -mr-4">
                    <div className="space-y-6 py-4">
                        {template.type === 'EMAIL' && processedSubject && (
                            <div className="border-b pb-4">
                                <span className="text-sm font-medium text-gray-500">Subject:</span>
                                <p className="text-lg font-medium mt-1">{processedSubject}</p>
                            </div>
                        )}

                        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100 min-h-[300px]">
                            <div className="prose prose-sm max-w-none whitespace-pre-wrap font-mono text-sm">
                                {processedBody}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t mt-auto">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close Preview
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
