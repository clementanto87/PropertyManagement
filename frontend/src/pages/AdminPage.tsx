import React, { useState, useEffect } from 'react';
import { useAuth, Role } from '../context/AuthContext';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { NotificationBell } from '../components/layout/NotificationBell';
import {
    Plus,
    Building,
    User as UserIcon,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Shield,
    Pencil,
    Trash2
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import CareTakersPage from './CareTakersPage';
import HouseOwnersPage from './HouseOwnersPage';
import ManagersPage from './ManagersPage';
import VendorsPage from './VendorsPage';
import { Users, Briefcase } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    managedProperties: { id: string; name: string }[];
}

interface Property {
    id: string;
    name: string;
}

export default function AdminPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [properties, setProperties] = useState<Property[]>([]);
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [isEditUserOpen, setIsEditUserOpen] = useState(false);
    const [isDeleteUserOpen, setIsDeleteUserOpen] = useState(false);
    const [isAssignPropertyOpen, setIsAssignPropertyOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'MANAGER' as Role });
    const [editUser, setEditUser] = useState({ name: '', email: '', role: 'MANAGER' as Role });
    const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
        fetchProperties();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await api.get<User[]>('/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProperties = async () => {
        try {
            const data = await api.get<{ items: Property[] }>('/properties');
            setProperties(data.items);
        } catch (error) {
            console.error('Failed to fetch properties:', error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/users', newUser);
            setIsAddUserOpen(false);
            fetchUsers();
            setNewUser({ name: '', email: '', password: '', role: 'MANAGER' });
        } catch (error) {
            console.error('Failed to create user:', error);
            alert('Failed to create user');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            await api.patch(`/users/${selectedUser.id}`, editUser);
            setIsEditUserOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('Failed to update user');
        }
    };

    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        try {
            await api.delete(`/users/${selectedUser.id}`);
            setIsDeleteUserOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user');
        }
    };

    const handleAssignProperties = async () => {
        if (!selectedUser) return;
        try {
            await api.patch(`/users/${selectedUser.id}/properties`, { propertyIds: selectedProperties });
            setIsAssignPropertyOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Failed to assign properties:', error);
            alert('Failed to assign properties');
        }
    };

    const openEditModal = (user: User) => {
        setSelectedUser(user);
        setEditUser({ name: user.name, email: user.email, role: user.role });
        setIsEditUserOpen(true);
    };

    const openDeleteModal = (user: User) => {
        setSelectedUser(user);
        setIsDeleteUserOpen(true);
    };

    const openAssignModal = (user: User) => {
        setSelectedUser(user);
        setSelectedProperties(user.managedProperties.map(p => p.id));
        setIsAssignPropertyOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center p-8">
                    <div className="relative w-16 h-16 mx-auto mb-4">
                        <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30 border-t-blue-500 animate-spin"></div>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Loading Users...</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            <div className="px-6 py-4">
                <Tabs defaultValue="managers" className="space-y-6">
                    <TabsList className="bg-muted p-1 inline-flex h-12 items-center justify-center rounded-lg">
                        <TabsTrigger value="managers" className="h-10 px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Managers
                        </TabsTrigger>
                        <TabsTrigger value="vendors" className="h-10 px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all">
                            <Briefcase className="w-4 h-4 mr-2" />
                            Vendors
                        </TabsTrigger>
                        <TabsTrigger value="caretakers" className="h-10 px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all">
                            <UserIcon className="w-4 h-4 mr-2" />
                            Care Takers
                        </TabsTrigger>
                        <TabsTrigger value="houseowners" className="h-10 px-6 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md transition-all">
                            <Building className="w-4 h-4 mr-2" />
                            House Owners
                        </TabsTrigger>
                    </TabsList>



                    <TabsContent value="vendors">
                        <VendorsPage />
                    </TabsContent>

                    <TabsContent value="managers">
                        <ManagersPage />
                    </TabsContent>

                    <TabsContent value="caretakers">
                        <CareTakersPage />
                    </TabsContent>

                    <TabsContent value="houseowners">
                        <HouseOwnersPage />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Edit User Dialog */}
            <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateUser} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Name</Label>
                            <Input
                                id="edit-name"
                                value={editUser.name}
                                onChange={e => setEditUser({ ...editUser, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editUser.email}
                                onChange={e => setEditUser({ ...editUser, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Role</Label>
                            <select
                                id="edit-role"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={editUser.role}
                                onChange={e => setEditUser({ ...editUser, role: e.target.value as Role })}
                            >
                                {currentUser?.role === 'ADMIN' && <option value="ADMIN">Admin</option>}
                                <option value="MANAGER">Manager</option>
                                <option value="CARETAKER">Caretaker</option>
                                <option value="HOUSEOWNER">Houseowner</option>
                            </select>
                        </div>
                        <Button type="submit" className="w-full">Update User</Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteUserOpen} onOpenChange={setIsDeleteUserOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
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

            {/* Assign Properties Dialog */}
            <Dialog open={isAssignPropertyOpen} onOpenChange={setIsAssignPropertyOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Assign Properties to {selectedUser?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="max-h-[300px] overflow-y-auto space-y-2 border rounded p-2">
                            {properties.map(property => (
                                <div key={property.id} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`prop-${property.id}`}
                                        checked={selectedProperties.includes(property.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedProperties([...selectedProperties, property.id]);
                                            } else {
                                                setSelectedProperties(selectedProperties.filter(id => id !== property.id));
                                            }
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor={`prop-${property.id}`}>{property.name}</Label>
                                </div>
                            ))}
                        </div>
                        <Button onClick={handleAssignProperties} className="w-full">Save Assignments</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
