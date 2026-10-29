import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, JwtClaims, LoginRequest, RegisterRequest } from '@/types/auth.types';
import { authService } from '@/services/auth.service';
import { storage } from '@/utils/storage';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<string>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwtPayload(token: string): JwtClaims | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (err) {
    console.error('Failed to parse JWT payload', err);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuthFromToken = useCallback((token: string | null) => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub || !payload.role) {
      storage.removeToken();
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Check expiration (exp is in seconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      storage.removeToken();
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser({
      username: payload.sub,
      role: payload.role,
      token,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const savedToken = storage.getToken();
    initAuthFromToken(savedToken);

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [initAuthFromToken]);

  const login = async (credentials: LoginRequest): Promise<AuthUser> => {
    const token = await authService.login(credentials);
    storage.setToken(token);

    const payload = decodeJwtPayload(token);
    if (!payload || !payload.sub || !payload.role) {
      throw new Error('Invalid token returned by authentication server');
    }

    const authUser: AuthUser = {
      username: payload.sub,
      role: payload.role,
      token,
    };
    setUser(authUser);
    return authUser;
  };

  const register = async (payload: RegisterRequest): Promise<string> => {
    return await authService.register(payload);
  };

  const logout = () => {
    storage.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
