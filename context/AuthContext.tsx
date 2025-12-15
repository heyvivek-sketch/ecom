
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';

interface AuthContextType {
  user: any | null; // using any temporarily to handle token extension
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('luxemart_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('luxemart_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Auth server unreachable. Logging in with Mock User.");
      // Fallback Mock Login
      const mockUser = {
        id: 'mock-user-id',
        name: email.includes('admin') ? 'Admin User' : 'Demo User',
        email: email,
        role: email.includes('admin') ? Role.ADMIN : Role.USER,
        token: 'mock-jwt-token'
      };
      setUser(mockUser);
      localStorage.setItem('luxemart_user', JSON.stringify(mockUser));
      return true;
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        const userData = { ...data.user, token: data.token };
        setUser(userData);
        localStorage.setItem('luxemart_user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (e) {
      console.warn("Auth server unreachable. Registering Mock User.");
       const mockUser = {
        id: 'mock-user-id-' + Date.now(),
        name: name,
        email: email,
        role: Role.USER,
        token: 'mock-jwt-token'
      };
      setUser(mockUser);
      localStorage.setItem('luxemart_user', JSON.stringify(mockUser));
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('luxemart_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAdmin: user?.role === Role.ADMIN }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
