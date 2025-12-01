import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, Role } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { NotificationBell } from '../components/layout/NotificationBell';
import {
    Plus,
    Building,
    User as UserIcon,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Phone,
    Pencil,
    Trash2,
    Briefcase
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from 'sonner';
import { managerService, Manager } from '@/api/managerService';

export default function ManagersPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [users, setUsers] = useState<Manager[]>([]);
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Manager | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await managerService.getManagers();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch managers:', error);
            toast.error('Failed to load managers');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await managerService.deleteManager(selectedUser.id);
            setIsDeleteUserOpen(false);
            fetchUsers();
            toast.success('Manager deleted successfully');
        } catch (error) {
            console.error('Failed to delete manager:', error);
            toast.error('Failed to delete manager');
        }
    };

    const openDeleteModal = (user: Manager) => {
        setSelectedUser(user);
        setIsDeleteUserOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Loading Managers...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Professional Sticky Header */}
            <div className="bg-card border-b border-border sticky top-0 z-40">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center border border-border">
                                    <Briefcase className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-card"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-foreground">Managers</h1>
                                <p className="text-sm text-muted-foreground">Manage property managers</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <NotificationBell />
                            <div className="h-8 w-px bg-border mx-1"></div>
                            <Button
                                onClick={() => navigate('/dashboard/managers/new', { state: { returnTo: location.pathname } })}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Manager
                            </Button>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2.5 border border-input rounded-lg leading-5 bg-background placeholder-muted-foreground focus:outline-none focus:bg-card focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all sm:text-sm text-foreground"
                                placeholder="Search managers by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2 text-muted-foreground">
                            <Filter className="w-4 h-4" />
                            Filters
                        </Button>
                    </div>
                </div>
            </div>

            {/* Managers List */}
            <div className="px-6 mt-8 max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{filteredUsers.length}</span> managers
                    </p>
                </div>

                {filteredUsers.length === 0 ? (
                    <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                            <Briefcase className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No Managers Found</h3>
                        <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                            {searchQuery ? 'No managers match your search.' : 'Get started by adding a new manager.'}
                        </p>
                        {!searchQuery && (
                            <div className="mt-6">
                                <Button
                                    onClick={() => navigate('/dashboard/managers/new', { state: { returnTo: location.pathname } })}
                                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                >
                                    Add Manager
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredUsers.map((user) => (
                            <div
                                key={user.id}
                                onClick={() => navigate(`/dashboard/managers/${user.id}/edit`, { state: { returnTo: location.pathname } })}
                                className="group bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer flex flex-col h-full"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                                            {user.name?.charAt(0) || 'M'}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                {user.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate max-w-[150px]">{user.email}</span>
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    <span className="truncate max-w-[150px]">{user.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <MoreHorizontal className="w-5 h-5 text-muted-foreground group-hover:text-foreground" />
                                </div>

                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="capitalize">
                                            Manager
                                        </Badge>
                                    </div>

                                    {user.managedProperties && user.managedProperties.length > 0 && (
                                        <div className="space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">Managed Properties:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {user.managedProperties.map(p => (
                                                    <Badge key={p.id} variant="secondary" className="text-xs">
                                                        {p.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteModal(user);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Manager</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.</p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteUserOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteUser}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
