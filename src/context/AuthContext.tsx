import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as adminAuthApi from '../services/adminAuthApi';
import { assertApiConfig } from '../config/env';

type AuthContextValue = {
  admin: adminAuthApi.AdminProfile | null;
  bootstrapping: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<adminAuthApi.AdminProfile | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    assertApiConfig();
    setAdmin(adminAuthApi.getAdminProfile());
    setBootstrapping(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { admin: next } = await adminAuthApi.signIn(email, password);
    setAdmin(next);
  }, []);

  const logout = useCallback(async () => {
    await adminAuthApi.signOut();
    setAdmin(null);
  }, []);

  const value = useMemo(
    () => ({ admin, bootstrapping, login, logout }),
    [admin, bootstrapping, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
