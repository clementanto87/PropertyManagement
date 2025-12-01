import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type TenantUser = {
  id: string;
  fullName: string;
  email: string;
  unitLabel: string;
};

type AuthContextValue = {
  user: TenantUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: TenantUser | null) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const demoTenantId = import.meta.env.VITE_DEMO_TENANT_ID ?? 'tenant_demo';

export const DEMO_TENANT: TenantUser = {
  id: demoTenantId,
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  unitLabel: 'Unit 12B · Sunrise Towers'
};

// Helper functions to manage localStorage
const getStoredUser = (): TenantUser | null => {
  try {
    const storedUser = localStorage.getItem('tenant_user');
    const token = localStorage.getItem('tenant_token');
    
    if (storedUser && token) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

const clearStoredAuth = () => {
  localStorage.removeItem('tenant_token');
  localStorage.removeItem('tenant_user');
};

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUserState] = useState<TenantUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserState(storedUser);
    } else {
      // Only use demo tenant if no stored user and in development
      if (import.meta.env.DEV && import.meta.env.VITE_USE_DEMO_TENANT === 'true') {
        setUserState(DEMO_TENANT);
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when user changes
  const setUser = useCallback((newUser: TenantUser | null) => {
    setUserState(newUser);
    if (newUser) {
      localStorage.setItem('tenant_user', JSON.stringify(newUser));
    } else {
      clearStoredAuth();
    }
  }, []);

  const signOut = useCallback(() => {
    setUserState(null);
    clearStoredAuth();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      setUser,
      signOut
    }),
    [user, isLoading, setUser, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
