import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { leaseAgreementService } from '../services/leaseAgreementService';
import { leaseService } from '../services/leaseService';
import { Button } from '@/components/ui/button';
import { FileText, Send, Download, XCircle, Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function LeaseAgreementPage() {
    const { leaseId } = useParams<{ leaseId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [showPreview, setShowPreview] = useState(false);

    const { data: lease, isLoading: leaseLoading } = useQuery({
        queryKey: ['lease', leaseId],
        queryFn: () => leaseService.getLease(leaseId!),
        enabled: !!leaseId,
    });

    const { data: agreements, isLoading: agreementsLoading } = useQuery({
        queryKey: ['lease-agreements', leaseId],
        queryFn: () => leaseAgreementService.getAgreements(leaseId),
        enabled: !!leaseId,
    });

    const createMutation = useMutation({
        mutationFn: () =>
            leaseAgreementService.createAgreement({
                leaseId: leaseId!,
                templateContent: '', // Will use default template
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lease-agreements', leaseId] });
            toast.success('Lease agreement created successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to create agreement');
        },
    });

    const sendMutation = useMutation({
        mutationFn: ({ agreementId, email }: { agreementId: string; email: string }) =>
            leaseAgreementService.sendForSignature(agreementId, email),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lease-agreements', leaseId] });
            toast.success('Agreement sent to tenant for signature');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to send agreement');
        },
    });

    const voidMutation = useMutation({
        mutationFn: (agreementId: string) => leaseAgreementService.voidAgreement(agreementId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lease-agreements', leaseId] });
            toast.success('Agreement voided successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to void agreement');
        },
    });

    const handleDownloadPDF = async (agreementId: string) => {
        try {
            const blob = await leaseAgreementService.downloadPDF(agreementId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lease-agreement-${agreementId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success('PDF downloaded successfully');
        } catch (error) {
            toast.error('Failed to download PDF');
        }
    };

    const handlePreviewPDF = async () => {
        try {
            const blob = await leaseAgreementService.previewPDF(leaseId!);
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
            toast.success('Opening PDF preview');
        } catch (error) {
            toast.error('Failed to preview PDF');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'SIGNED':
                return 'bg-green-100 text-green-800';
            case 'EXPIRED':
                return 'bg-red-100 text-red-800';
            case 'VOIDED':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (leaseLoading || agreementsLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Loading...</div>
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Lease not found</div>
            </div>
        );
    }

    const currentAgreement = agreements?.[0];

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard/leases')}
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Leases
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Lease Agreement</h1>
                <p className="text-gray-600 mt-2">
                    Manage digital lease agreement for {lease.tenant?.name}
                </p>
            </div>

            {/* Lease Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Lease Information</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Tenant</p>
                        <p className="font-medium">{lease.tenant?.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Property</p>
                        <p className="font-medium">{lease.unit?.property?.address}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Unit</p>
                        <p className="font-medium">Unit {lease.unit?.unitNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Rent Amount</p>
                        <p className="font-medium">${lease.rentAmount?.toLocaleString()}/month</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Lease Term</p>
                        <p className="font-medium">
                            {new Date(lease.startDate).toLocaleDateString()} -{' '}
                            {new Date(lease.endDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium capitalize">{lease.status?.toLowerCase()}</p>
                    </div>
                </div>
            </div>

            {/* Agreement Actions */}
            {!currentAgreement ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Agreement Created</h3>
                    <p className="text-gray-600 mb-6">
                        Create a digital lease agreement to send to the tenant for signature
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={handlePreviewPDF} variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Preview PDF
                        </Button>
                        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                            <FileText className="w-4 h-4 mr-2" />
                            {createMutation.isPending ? 'Creating...' : 'Create Agreement'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-lg font-semibold">Agreement Status</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Created on {new Date(currentAgreement.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                currentAgreement.status
                            )}`}
                        >
                            {currentAgreement.status}
                        </span>
                    </div>

                    {/* Signatures */}
                    {currentAgreement.signatures && currentAgreement.signatures.length > 0 && (
                        <div className="mb-6">
                            <h3 className="font-medium mb-3">Signatures</h3>
                            <div className="space-y-3">
                                {currentAgreement.signatures.map((sig: any) => (
                                    <div
                                        key={sig.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">{sig.signerName}</p>
                                                <p className="text-sm text-gray-600">
                                                    {sig.signerType} • {sig.signatureMethod}
                                                </p>
                                            </div>
                                        </div>
                                        {sig.signedAt && (
                                            <p className="text-sm text-gray-600">
                                                {new Date(sig.signedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={() => handleDownloadPDF(currentAgreement.id)}
                            variant="outline"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download PDF
                        </Button>

                        {currentAgreement.status === 'DRAFT' && (
                            <>
                                <Button
                                    onClick={() =>
                                        sendMutation.mutate({
                                            agreementId: currentAgreement.id,
                                            email: lease.tenant?.email || '',
                                        })
                                    }
                                    disabled={sendMutation.isPending || !lease.tenant?.email}
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {sendMutation.isPending ? 'Sending...' : 'Send to Tenant'}
                                </Button>
                                <Button
                                    onClick={() => voidMutation.mutate(currentAgreement.id)}
                                    variant="outline"
                                    disabled={voidMutation.isPending}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Void
                                </Button>
                            </>
                        )}

                        {currentAgreement.status === 'PENDING' && (
                            <Button
                                onClick={() => voidMutation.mutate(currentAgreement.id)}
                                variant="outline"
                                disabled={voidMutation.isPending}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        )}
                    </div>

                    {currentAgreement.status === 'PENDING' && currentAgreement.expiresAt && (
                        <p className="text-sm text-gray-600 mt-4">
                            Expires on {new Date(currentAgreement.expiresAt).toLocaleDateString()}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
