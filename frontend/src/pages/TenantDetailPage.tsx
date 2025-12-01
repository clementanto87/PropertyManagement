import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    DollarSign,
    FileText,
    MessageSquare,
    Edit,
    User,
    Bell,
    AlertCircle,
    CheckCircle2,
    Clock,
    CreditCard,
    Home
} from 'lucide-react';
import { NotificationBell } from '../components/layout/NotificationBell';
import { Button } from '@/components/ui/button';
import { tenantService, type Tenant } from '@/api/tenantService';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { DocumentList } from '@/components/documents/DocumentList';
import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog';
import { Document, documentService } from '@/api/documentService';
import { CommunicationList } from '@/features/communications/components/CommunicationList';
import { SendEmailDialog } from '@/components/communications/SendEmailDialog';

type Lease = {
    id: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    securityDeposit: number;
    status: string;
    unit?: {
        id: string;
        unitNumber: string;
        property?: {
            id: string;
            name: string;
            address: string;
        };
    };
    payments?: Payment[];
};

type Payment = {
    id: string;
    amount: number;
    dueDate: string;
    paidAt?: string;
    status: string;
    createdAt: string;
};

export default function TenantDetailPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [tenant, setTenant] = useState<Tenant | null>(null);
    const [leases, setLeases] = useState<Lease[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);

    useEffect(() => {
        if (id) {
            loadAllData(id);
        }
    }, [id]);

    const loadAllData = async (tenantId: string) => {
        try {
            // Load tenant data
            const tenantData = await tenantService.getTenant(tenantId);
            setTenant(tenantData);

            // Load leases with payments
            try {
                const leasesResponse = await api.get<{ items: Lease[] }>(`/leases?tenantId=${tenantId}`);
                setLeases(leasesResponse.items || []);
            } catch (error) {
                console.error('Failed to load leases:', error);
            }

            // Load documents
            try {
                const docs = await documentService.getDocuments({ tenantId });
                setDocuments(docs);
            } catch (error) {
                console.error('Failed to load documents:', error);
            }
        } catch (error) {
            console.error('Failed to load tenant:', error);
            toast.error('Failed to load tenant details');
            navigate('/dashboard/tenants');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{t('tenantProfile.loading')}</h2>
                </div>
            </div>
        );
    }

    if (!tenant) {
        return null;
    }

    // Get tenant initials
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Professional Sticky Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard/tenants')}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{t('tenantProfile.title')}</h1>
                                <p className="text-sm text-muted-foreground">{t('tenantProfile.subtitle')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <div className="h-8 w-px bg-border mx-1"></div>
                            <Button
                                onClick={() => navigate(`/dashboard/tenants/${id}/communications`)}
                                variant="outline"
                                className="gap-2"
                            >
                                <MessageSquare className="w-4 h-4" />
                                {t('tenantProfile.actions.message')}
                            </Button>
                            <Button
                                onClick={() => navigate(`/dashboard/tenants/${id}/edit`)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                {t('tenantProfile.actions.edit')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-6xl mx-auto space-y-6">
                {/* Tenant Header Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {getInitials(tenant.name)}
                            </div>

                            {/* Tenant Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">{tenant.name}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        {t('tenantProfile.header.activeLease')}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {t('tenantProfile.header.memberSince')} {new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border">
                        <h3 className="text-lg font-bold text-foreground">{t('tenantProfile.contactInfo.title')}</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('tenantProfile.contactInfo.email')}</p>
                                    <p className="text-base font-semibold text-foreground">{tenant.email || t('tenantProfile.contactInfo.notProvided')}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{t('tenantProfile.contactInfo.phone')}</p>
                                    <p className="text-base font-semibold text-foreground">{tenant.phone || t('tenantProfile.contactInfo.notProvided')}</p>
                                </div>
                            </div>

                            {tenant.emergencyContact && (
                                <div className="flex items-center gap-4 md:col-span-2">
                                    <div className="w-12 h-12 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">{t('tenantProfile.contactInfo.emergencyContact')}</p>
                                        <p className="text-base font-semibold text-foreground">{tenant.emergencyContact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lease Details */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('tenantProfile.leaseDetails.title')}</h3>
                        {leases.length > 0 && (
                            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">{leases.length} {leases.length === 1 ? t('tenantProfile.leaseDetails.activeLease_one') : t('tenantProfile.leaseDetails.activeLease_other')}</span>
                        )}
                    </div>
                    <div className="p-6">
                        {leases.length === 0 ? (
                            <div className="text-center py-8">
                                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">{t('tenantProfile.leaseDetails.noLease')}</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('tenantProfile.leaseDetails.createLease')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leases.map((lease) => (
                                    <div key={lease.id} className="border border-border rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                    <Home className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground">
                                                        {lease.unit?.property?.name || t('tenantProfile.leaseDetails.property')} - {t('tenantProfile.leaseDetails.unit')} {lease.unit?.unitNumber || 'N/A'}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">{lease.unit?.property?.address || t('tenantProfile.leaseDetails.addressNotAvailable')}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                                {lease.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('tenantProfile.leaseDetails.startDate')}</p>
                                                <p className="text-sm font-medium text-foreground">{new Date(lease.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('tenantProfile.leaseDetails.endDate')}</p>
                                                <p className="text-sm font-medium text-foreground">{new Date(lease.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('tenantProfile.leaseDetails.monthlyRent')}</p>
                                                <p className="text-sm font-medium text-foreground">${lease.rentAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground">{t('tenantProfile.leaseDetails.securityDeposit')}</p>
                                                <p className="text-sm font-medium text-foreground">${lease.securityDeposit.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('tenantProfile.paymentHistory.title')}</h3>
                        <Button variant="outline" size="sm" className="gap-2">
                            <CreditCard className="w-4 h-4" />
                            {t('tenantProfile.actions.recordPayment')}
                        </Button>
                    </div>
                    <div className="p-6">
                        {leases.length === 0 || !leases.some(l => l.payments && l.payments.length > 0) ? (
                            <div className="text-center py-8">
                                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                <p className="text-muted-foreground">{t('tenantProfile.paymentHistory.noHistory')}</p>
                                <p className="text-sm text-muted-foreground mt-1">{t('tenantProfile.paymentHistory.noHistoryDesc')}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leases.flatMap(lease => lease.payments || []).slice(0, 10).map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                payment.status === 'OVERDUE' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'
                                                }`}>
                                                <DollarSign className={`w-5 h-5 ${payment.status === 'PAID' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    payment.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-foreground">${payment.amount.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {payment.paidAt ? `${t('tenantProfile.paymentHistory.paid')} ${formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}` : `${t('tenantProfile.paymentHistory.due')} ${new Date(payment.dueDate).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' :
                                            payment.status === 'OVERDUE' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
                                            }`}>
                                            {payment.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Communications */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('tenantProfile.communications.title')}</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setShowEmailDialog(true)}
                            >
                                <Mail className="w-4 h-4" />
                                {t('tenantProfile.actions.sendEmail')}
                            </Button>
                            <Link to={`/dashboard/tenants/${id}/communications`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    {t('tenantProfile.actions.viewAll')}
                                </Button>
                            </Link>
                            <Link to={`/dashboard/tenants/${id}/communications?tab=message`}>
                                <Button size="sm" className="gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    {t('tenantProfile.communications.messages')}
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <CommunicationList tenantId={id} filterType={undefined} showFollowUpOnly={false} />
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">{t('tenantProfile.documents.title')}</h3>
                        <Button size="sm" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                            <FileText className="w-4 h-4" />
                            {t('tenantProfile.actions.uploadDocument')}
                        </Button>
                    </div>
                    <div className="p-6">
                        <DocumentList
                            documents={documents}
                            onDocumentDeleted={() => id && loadAllData(id)}
                        />
                    </div>
                </div>
            </div>

            {/* Upload Document Dialog */}
            <UploadDocumentDialog
                open={showUploadDialog}
                onOpenChange={setShowUploadDialog}
                onDocumentUploaded={() => id && loadAllData(id)}
                tenantId={id}
            />

            {/* Send Email Dialog */}
            <SendEmailDialog
                open={showEmailDialog}
                onOpenChange={setShowEmailDialog}
                tenantId={id || ''}
                tenantName={tenant?.name || ''}
                tenantEmail={tenant?.email}
                onEmailSent={() => {
                    // Refresh the page to show new communication
                    if (id) loadAllData(id);
                }}
            />
        </div>
    );
}
