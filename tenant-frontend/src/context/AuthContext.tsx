import { createContext, useCallback, useContext, useMemo, useState } from 'react';
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

type Props = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const [user, setUser] = useState<TenantUser | null>(DEMO_TENANT);

  const signOut = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setUser,
      signOut
    }),
    [user, signOut]
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
