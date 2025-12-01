import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { leaseAgreementService } from '../services/leaseAgreementService';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';

export default function SignAgreementPage() {
    const { agreementId } = useParams<{ agreementId: string }>();
    const navigate = useNavigate();
    const [signatureMethod, setSignatureMethod] = useState<'TYPED' | 'DRAWN'>('TYPED');
    const [typedName, setTypedName] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    const { data: agreement, isLoading } = useQuery({
        queryKey: ['lease-agreement', agreementId],
        queryFn: () => leaseAgreementService.getAgreement(agreementId!),
        enabled: !!agreementId,
    });

    const signMutation = useMutation({
        mutationFn: (data: any) => leaseAgreementService.signAgreement(agreementId!, data),
        onSuccess: (data: any) => {
            toast.success('Agreement signed successfully!');

            if (data.invitationToken) {
                setTimeout(() => {
                    navigate(`/tenant-setup/${data.invitationToken}`);
                }, 2000);
            } else {
                toast.info('Agreement signed! Redirecting to login...');
                setTimeout(() => {
                    window.location.href = 'http://localhost:5174/auth/login';
                }, 2000);
            }
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.error || 'Failed to sign agreement');
        },
    });

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
        setHasDrawn(true);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleSign = () => {
        let signatureData = '';

        if (signatureMethod === 'TYPED') {
            if (!typedName.trim()) {
                toast.error('Please enter your name');
                return;
            }
            signatureData = typedName;
        } else {
            if (!hasDrawn) {
                toast.error('Please draw your signature');
                return;
            }
            const canvas = canvasRef.current;
            if (canvas) {
                signatureData = canvas.toDataURL();
            }
        }

        signMutation.mutate({
            signerType: 'TENANT',
            signerName: signatureMethod === 'TYPED' ? typedName : agreement?.lease?.tenant?.name || '',
            signerEmail: agreement?.lease?.tenant?.email || '',
            signatureData,
            signatureMethod,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500">Loading agreement...</div>
            </div>
        );
    }

    if (!agreement) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Not Found</h2>
                    <p className="text-gray-600">This agreement link may be invalid or expired.</p>
                </div>
            </div>
        );
    }

    if (agreement.status === 'SIGNED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Already Signed</h2>
                    <p className="text-gray-600">This agreement has already been signed.</p>
                </div>
            </div>
        );
    }

    if (agreement.status === 'EXPIRED') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Agreement Expired</h2>
                    <p className="text-gray-600">This signing link has expired. Please contact your landlord.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Lease Agreement Signature</h1>
                    <p className="text-gray-600">
                        Please review and sign the lease agreement for {agreement.lease?.unit?.property?.address}
                    </p>
                </div>

                {/* Agreement Preview */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Agreement Details</h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                            <p className="text-sm text-gray-600">Property</p>
                            <p className="font-medium">{agreement.lease?.unit?.property?.address}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Unit</p>
                            <p className="font-medium">Unit {agreement.lease?.unit?.unitNumber}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Rent Amount</p>
                            <p className="font-medium">${agreement.lease?.rentAmount?.toLocaleString()}/month</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Lease Term</p>
                            <p className="font-medium">
                                {new Date(agreement.lease?.startDate).toLocaleDateString()} -{' '}
                                {new Date(agreement.lease?.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={async () => {
                            try {
                                const blob = await leaseAgreementService.downloadPDF(agreementId!);
                                const url = window.URL.createObjectURL(blob);
                                window.open(url, '_blank');
                            } catch (error) {
                                toast.error('Failed to open PDF');
                            }
                        }}
                        variant="outline"
                        className="w-full"
                    >
                        View Full Agreement (PDF)
                    </Button>
                </div>

                {/* Signature Section */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold mb-4">Sign Agreement</h2>

                    {/* Signature Method Toggle */}
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setSignatureMethod('TYPED')}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${signatureMethod === 'TYPED'
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Type Name
                        </button>
                        <button
                            onClick={() => setSignatureMethod('DRAWN')}
                            className={`flex-1 py-3 px-4 rounded-lg border-2 transition-colors ${signatureMethod === 'DRAWN'
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Draw Signature
                        </button>
                    </div>

                    {/* Typed Signature */}
                    {signatureMethod === 'TYPED' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type your full name
                            </label>
                            <input
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="John Doe"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            {typedName && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <p className="text-2xl font-signature italic">{typedName}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Drawn Signature */}
                    {signatureMethod === 'DRAWN' && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Draw your signature
                            </label>
                            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
                                <canvas
                                    ref={canvasRef}
                                    width={600}
                                    height={200}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    className="w-full cursor-crosshair bg-white"
                                />
                            </div>
                            <button
                                onClick={clearCanvas}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                            >
                                Clear Signature
                            </button>
                        </div>
                    )}

                    {/* Agreement Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-start gap-3">
                            <input type="checkbox" className="mt-1" required />
                            <span className="text-sm text-gray-700">
                                I have read and agree to the terms and conditions of this lease agreement. I understand
                                that this electronic signature is legally binding.
                            </span>
                        </label>
                    </div>

                    {/* Sign Button */}
                    <Button
                        onClick={handleSign}
                        disabled={signMutation.isPending}
                        className="w-full"
                    >
                        {signMutation.isPending ? 'Signing...' : 'Sign Agreement'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
