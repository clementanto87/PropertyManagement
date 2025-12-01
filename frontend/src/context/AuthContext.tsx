import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { getAuthToken, setAuth, clearAuth } from '../lib/auth';

export type Role = 'ADMIN' | 'MANAGER' | 'TENANT' | 'CARETAKER' | 'HOUSEOWNER';

interface User {
    id: string;
    email: string;
    name: string | null;
    role: Role;
    tenantId?: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    hasRole: (role: Role | Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const userData = await api.get<User>('/auth/me');
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to fetch user:', error);
                    clearAuth();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        // Cast userData to any to match AuthUser interface if needed, or update AuthUser interface
        setAuth(token, userData as any);
        setUser(userData);
    };

    const logout = () => {
        clearAuth();
        setUser(null);
        window.location.href = '/login';
    };

    const hasRole = (role: Role | Role[]) => {
        if (!user) return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
