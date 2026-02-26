// File: frontend/src/context/AuthContext.tsx
// Global authentication state.
// Replaces the old DUMMY_USERS / localStorage approach with real JWT + PHP API.
//
// Wrap your app with <AuthProvider> in main.tsx, then use the useAuth() hook anywhere.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/auth';
import type { User } from '../types';

// ── Shape of context value ─────────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;       // true while we verify the stored token on mount
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: 'student' | 'instructor') => Promise<void>;
  logout: () => void;
}

// ── Storage keys ───────────────────────────────────────────────────────────────
const TOKEN_KEY = 'hg_token';
const USER_KEY  = 'hg_user';

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,      setUser]      = useState<User | null>(null);
  const [token,     setToken]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount — restore session from localStorage then verify with /api/auth/me
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser  = localStorage.getItem(USER_KEY);

    if (storedToken) {
      setToken(storedToken);
      // Optimistically restore the cached user so the UI is instant
      if (storedUser) setUser(JSON.parse(storedUser));

      // Verify token is still valid server-side
      getMe()
        .then((freshUser) => {
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        })
        .catch(() => {
          // Token expired — clear everything
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          setToken(null);
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'instructor' = 'student'
  ) => {
    const { token: newToken, user: newUser } = await apiRegister(name, email, password, role);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
