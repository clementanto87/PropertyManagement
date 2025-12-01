import { api } from '@/lib/api';
import { Role } from '@/context/AuthContext';

export type Manager = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
    managedProperties?: { id: string; name: string }[];
    managedUnits?: { id: string; unitNumber: string }[];
};

export type CreateManagerInput = {
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: 'MANAGER';
    propertyIds?: string[];
    unitIds?: string[];
};

export type UpdateManagerInput = Partial<CreateManagerInput>;

export const managerService = {
    async createManager(data: CreateManagerInput): Promise<Manager> {
        return api.post<Manager>('/users', data);
    },

    async getManagers(): Promise<Manager[]> {
        const users = await api.get<Manager[]>('/users');
        return users.filter(u => u.role === 'MANAGER');
    },

    async getManager(id: string): Promise<Manager> {
        return api.get<Manager>(`/users/${id}`);
    },

    async updateManager(id: string, data: UpdateManagerInput): Promise<Manager> {
        return api.patch<Manager>(`/users/${id}`, data);
    },

    async deleteManager(id: string): Promise<void> {
        return api.delete(`/users/${id}`);
    },

    async assignProperties(id: string, propertyIds: string[], unitIds: string[]): Promise<Manager> {
        return api.patch<Manager>(`/users/${id}/properties`, { propertyIds, unitIds });
    }
};
