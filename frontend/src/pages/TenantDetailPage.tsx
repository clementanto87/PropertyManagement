import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
            <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Loading Tenant Profile</h2>
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
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Professional Sticky Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate('/dashboard/tenants')}
                                className="h-10 w-10 rounded-full hover:bg-gray-100 text-gray-500"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">Tenant Profile</h1>
                                <p className="text-sm text-gray-500">View and manage tenant details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                            <div className="h-8 w-px bg-gray-200 mx-1"></div>
                            <Button
                                onClick={() => navigate(`/dashboard/tenants/${id}/edit`)}
                                className="bg-gray-900 hover:bg-gray-800 text-white gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit Tenant
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-6xl mx-auto space-y-6">
                {/* Tenant Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            {/* Avatar */}
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {getInitials(tenant.name)}
                            </div>

                            {/* Tenant Info */}
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">{tenant.name}</h2>
                                <div className="flex items-center gap-3">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                        Active Lease
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Member since {new Date(tenant.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email Address</p>
                                    <p className="text-base font-semibold text-gray-900">{tenant.email || 'Not provided'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-emerald-50 flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone Number</p>
                                    <p className="text-base font-semibold text-gray-900">{tenant.phone || 'Not provided'}</p>
                                </div>
                            </div>

                            {tenant.emergencyContact && (
                                <div className="flex items-center gap-4 md:col-span-2">
                                    <div className="w-12 h-12 rounded-lg bg-amber-50 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Emergency Contact</p>
                                        <p className="text-base font-semibold text-gray-900">{tenant.emergencyContact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lease Details */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Lease Details</h3>
                        {leases.length > 0 && (
                            <span className="text-sm text-emerald-600 font-medium">{leases.length} Active Lease{leases.length > 1 ? 's' : ''}</span>
                        )}
                    </div>
                    <div className="p-6">
                        {leases.length === 0 ? (
                            <div className="text-center py-8">
                                <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No lease information available</p>
                                <p className="text-sm text-gray-400 mt-1">Create a lease to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {leases.map((lease) => (
                                    <div key={lease.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                                    <Home className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {lease.unit?.property?.name || 'Property'} - Unit {lease.unit?.unitNumber || 'N/A'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">{lease.unit?.property?.address || 'Address not available'}</p>
                                                </div>
                                            </div>
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                                                {lease.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Start Date</p>
                                                <p className="text-sm font-medium text-gray-900">{new Date(lease.startDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">End Date</p>
                                                <p className="text-sm font-medium text-gray-900">{new Date(lease.endDate).toLocaleDateString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Monthly Rent</p>
                                                <p className="text-sm font-medium text-gray-900">${lease.rentAmount.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Security Deposit</p>
                                                <p className="text-sm font-medium text-gray-900">${lease.securityDeposit.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                        <Button variant="outline" size="sm" className="gap-2">
                            <CreditCard className="w-4 h-4" />
                            Record Payment
                        </Button>
                    </div>
                    <div className="p-6">
                        {leases.length === 0 || !leases.some(l => l.payments && l.payments.length > 0) ? (
                            <div className="text-center py-8">
                                <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No payment history</p>
                                <p className="text-sm text-gray-400 mt-1">Payments will appear here once recorded</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {leases.flatMap(lease => lease.payments || []).slice(0, 10).map((payment) => (
                                    <div key={payment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${payment.status === 'PAID' ? 'bg-emerald-50' :
                                                payment.status === 'OVERDUE' ? 'bg-red-50' : 'bg-amber-50'
                                                }`}>
                                                <DollarSign className={`w-5 h-5 ${payment.status === 'PAID' ? 'text-emerald-600' :
                                                    payment.status === 'OVERDUE' ? 'text-red-600' : 'text-amber-600'
                                                    }`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">${payment.amount.toLocaleString()}</p>
                                                <p className="text-sm text-gray-500">
                                                    {payment.paidAt ? `Paid ${formatDistanceToNow(new Date(payment.paidAt), { addSuffix: true })}` : `Due ${new Date(payment.dueDate).toLocaleDateString()}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${payment.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' :
                                            payment.status === 'OVERDUE' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Communications</h3>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setShowEmailDialog(true)}
                            >
                                <Mail className="w-4 h-4" />
                                Send Email
                            </Button>
                            <Link to={`/dashboard/tenants/${id}/communications`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    View All
                                </Button>
                            </Link>
                            <Link to={`/dashboard/tenants/${id}/communications/new`}>
                                <Button size="sm" className="gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    New Message
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <CommunicationList tenantId={id} filterType={undefined} showFollowUpOnly={false} />
                    </div>
                </div>

                {/* Documents */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Documents</h3>
                        <Button size="sm" className="gap-2" onClick={() => setShowUploadDialog(true)}>
                            <FileText className="w-4 h-4" />
                            Upload Document
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
