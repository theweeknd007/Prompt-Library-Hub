import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetMe, User, setAuthTokenGetter } from '@workspace/api-client-react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('bp_token'));
  
  // Update token getter for API client whenever token changes
  useEffect(() => {
    setAuthTokenGetter(() => localStorage.getItem('bp_token'));
  }, [token]);

  const { data: user, isLoading: isQueryLoading, error } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    }
  });

  const isLoading = token ? isQueryLoading : false;

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('bp_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('bp_token');
    setToken(null);
  };

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
