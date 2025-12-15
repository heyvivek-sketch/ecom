import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('luxemart_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulate API delay
    await new Promise(res => setTimeout(res, 500));
    
    const foundUser = dbService.findUser(email);
    if (foundUser && foundUser.password === pass) {
      const { password, ...safeUser } = foundUser;
      setUser(safeUser as User);
      localStorage.setItem('luxemart_user', JSON.stringify(safeUser));
      return true;
    }
    return false;
  };

  const register = async (name: string, email: string, pass: string) => {
    await new Promise(res => setTimeout(res, 500));
    
    if (dbService.findUser(email)) return false;

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password: pass,
      role: Role.USER
    };
    dbService.createUser(newUser);
    const { password, ...safeUser } = newUser;
    setUser(safeUser as User);
    localStorage.setItem('luxemart_user', JSON.stringify(safeUser));
    return true;
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