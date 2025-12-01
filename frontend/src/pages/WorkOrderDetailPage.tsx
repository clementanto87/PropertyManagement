import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Building2,
    User,
    Clock,
    CheckCircle2,
    AlertCircle,
    Wrench,
    MoreHorizontal,
    Edit,
    Trash2,
    PauseCircle,
    UserPlus,
    MapPin,
    Phone,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { workOrderService, WorkOrder, WorkOrderStatus } from '@/api/workOrderService';
import { toast } from 'sonner';

const getStatusBadge = (status: WorkOrderStatus) => {
    switch (status) {
        case 'NEW':
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                    <Clock className="w-4 h-4 mr-2" />
                    New
                </span>
            );
        case 'ASSIGNED':
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Assigned
                </span>
            );
        case 'IN_PROGRESS':
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                    <Wrench className="w-4 h-4 mr-2" />
                    In Progress
                </span>
            );
        case 'ON_HOLD':
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30">
                    <PauseCircle className="w-4 h-4 mr-2" />
                    On Hold
                </span>
            );
        case 'COMPLETED':
            return (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Completed
                </span>
            );
        default:
            return null;
    }
};

export default function WorkOrderDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        if (id) {
            loadWorkOrder(id);
        }
    }, [id]);

    const loadWorkOrder = async (workOrderId: string) => {
        try {
            const data = await workOrderService.getWorkOrder(workOrderId);
            setWorkOrder(data);
        } catch (error) {
            console.error('Failed to load work order:', error);
            toast.error('Failed to load work order details');
            navigate('/dashboard/work-orders');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!id) return;
        try {
            await workOrderService.deleteWorkOrder(id);
            toast.success('Work order deleted successfully');
            navigate('/dashboard/work-orders');
        } catch (error) {
            console.error('Failed to delete work order:', error);
            toast.error('Failed to delete work order');
        }
    };

    const handleStatusChange = async (newStatus: WorkOrderStatus) => {
        if (!id || !workOrder) return;
        try {
            const updated = await workOrderService.updateWorkOrder(id, { status: newStatus });
            setWorkOrder(updated);
            toast.success(`Status updated to ${newStatus.toLowerCase().replace('_', ' ')}`);
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Loading Details</h2>
                </div>
            </div>
        );
    }

    if (!workOrder) return null;

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
                                onClick={() => navigate('/dashboard/work-orders')}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Work Order Details</h1>
                                <p className="text-sm text-muted-foreground">#{workOrder.id.slice(-6).toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(true)}
                                className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </Button>
                            <Button
                                onClick={() => navigate(`/dashboard/work-orders/${id}/edit`)}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-5xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-card rounded-xl border border-border shadow-sm p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-2xl font-bold text-foreground">{workOrder.title}</h1>
                                {getStatusBadge(workOrder.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created {new Date(workOrder.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Last updated {new Date(workOrder.updatedAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {workOrder.status !== 'NEW' && (
                                <Button variant="outline" size="sm" onClick={() => handleStatusChange('NEW')}>
                                    Mark New
                                </Button>
                            )}
                            {workOrder.status !== 'ASSIGNED' && (
                                <Button variant="outline" size="sm" onClick={() => handleStatusChange('ASSIGNED')}>
                                    Mark Assigned
                                </Button>
                            )}
                            {workOrder.status !== 'IN_PROGRESS' && (
                                <Button variant="outline" size="sm" onClick={() => handleStatusChange('IN_PROGRESS')}>
                                    Mark In Progress
                                </Button>
                            )}
                            {workOrder.status !== 'COMPLETED' && (
                                <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-900/20" onClick={() => handleStatusChange('COMPLETED')}>
                                    Mark Completed
                                </Button>
                            )}
                        </div>
                    </div>

                    {workOrder.description && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <h3 className="text-sm font-medium text-foreground mb-2">Description</h3>
                            <p className="text-muted-foreground whitespace-pre-wrap">{workOrder.description}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Location Info */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <h2 className="text-base font-bold text-foreground">Location</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            {workOrder.unit ? (
                                <>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Property</p>
                                        <p className="font-medium text-foreground">{workOrder.unit.property?.title || 'N/A'}</p>
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                                            <MapPin className="w-3.5 h-3.5" />
                                            {workOrder.unit.property?.address || 'No address'}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Unit</p>
                                        <p className="font-medium text-foreground">Unit {workOrder.unit.unitNumber}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground italic">No location information available</p>
                            )}
                        </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50 flex items-center gap-3">
                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                <User className="w-5 h-5" />
                            </div>
                            <h2 className="text-base font-bold text-foreground">Assigned Vendor</h2>
                        </div>
                        <div className="p-6">
                            {workOrder.vendor ? (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                                        <p className="font-medium text-foreground">{workOrder.vendor.name}</p>
                                        {workOrder.vendor.companyName && (
                                            <p className="text-sm text-muted-foreground">{workOrder.vendor.companyName}</p>
                                        )}
                                    </div>
                                    {/* Add contact info if available in vendor object */}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground mb-4">No vendor assigned</p>
                                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/work-orders/${id}/edit`)}>
                                        Assign Vendor
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-xl max-w-md w-full p-6 shadow-xl border border-border">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Delete Work Order</h3>
                                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                            Are you sure you want to delete this work order?
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteDialog(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
