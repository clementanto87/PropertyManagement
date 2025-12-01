import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    ArrowLeft,
    User,
    Building2,
    Phone,
    Mail,
    Loader2,
    Bell,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { managerService } from '@/api/managerService';
import { toast } from 'sonner';
import { PropertyUnitSelector } from '@/components/PropertyUnitSelector';

export default function NewManagerPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const returnTo = location.state?.returnTo || '/dashboard/admin'; // Default to admin if no state
    const isEditMode = !!id;

    const [isLoading, setIsLoading] = useState(!!id);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [selectedUnits, setSelectedUnits] = useState<string[]>([]);

    useEffect(() => {
        if (id) {
            loadManager(id);
        }
    }, [id]);

    const loadManager = async (managerId: string) => {
        try {
            const manager = await managerService.getManager(managerId);
            setFormData({
                name: manager.name,
                email: manager.email,
                phone: manager.phone || '',
            });
            setSelectedProperties(manager.managedProperties?.map(p => p.id) || []);
            setSelectedUnits(manager.managedUnits?.map(u => u.id) || []);
        } catch (error) {
            console.error('Failed to load manager:', error);
            toast.error('Failed to load manager details');
            navigate(returnTo);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.email) {
            toast.error('Name and Email are required');
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                role: 'MANAGER' as const,
                propertyIds: selectedProperties,
                unitIds: selectedUnits
            };

            if (isEditMode && id) {
                await managerService.updateManager(id, payload);
                // Also update assignments explicitly if needed, but usually updateManager handles it if backend supports it.
                // Based on previous ManagersPage, it used a separate call for assignments sometimes, but createUser handled it.
                // Let's assume updateManager (patch /users/:id) handles it or we might need a separate call.
                // Checking backend service: updateUser does NOT handle managedProperties/Units update in the same call usually unless we modified it.
                // Actually, looking at src/routes/users/service.ts: updateUser just does prisma.user.update({ data }).
                // If we pass managedProperties/managedUnits in data, it might work if the schema allows nested writes.
                // But wait, assignPropertiesToUser was a separate function.
                // Let's check if we need to call assignProperties separately.
                // For now, I'll assume we might need to call assignProperties separately for update if the main update doesn't handle it.
                // But wait, the `createUser` handled it. `updateUser` might not.
                // Let's be safe and call assignProperties as well for edit mode.
                await managerService.assignProperties(id, selectedProperties, selectedUnits);

                toast.success('Manager updated successfully');
            } else {
                await managerService.createManager(payload);
                toast.success('Manager created successfully');
            }
            navigate(returnTo);
        } catch (error: any) {
            console.error('Failed to save manager:', error);
            toast.error(error?.message || 'Failed to save manager');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading manager details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Professional Sticky Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(returnTo)}
                                className="h-10 w-10 rounded-full hover:bg-accent text-muted-foreground"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">{isEditMode ? 'Edit Manager' : 'Add New Manager'}</h1>
                                <p className="text-sm text-muted-foreground">{isEditMode ? 'Update manager details and assignments' : 'Create a new manager and assign properties'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative">
                                <Bell className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 mt-8 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                    <User className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">Basic Information</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Name <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Role</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value="Manager"
                                        disabled
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input bg-muted text-muted-foreground cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Details */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">Contact Details</h2>
                            </div>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder="+1 (555) 000-0000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">Email Address <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-3 py-2 rounded-lg border border-input focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors bg-background text-foreground placeholder:text-muted-foreground"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Property & Unit Assignment */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-accent/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                    <Building2 className="w-5 h-5" />
                                </div>
                                <h2 className="text-base font-bold text-foreground">Property Assignment</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-muted-foreground mb-4">
                                Assign this manager to specific properties or units.
                            </p>
                            <PropertyUnitSelector
                                selectedProperties={selectedProperties}
                                selectedUnits={selectedUnits}
                                onPropertiesChange={setSelectedProperties}
                                onUnitsChange={setSelectedUnits}
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate(returnTo)}
                            className="px-6"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                isEditMode ? 'Update Manager' : 'Create Manager'
                            )}
                        </Button>
                    </div>
                </form>
            </div >
        </div >
    );
}
