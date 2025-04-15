
import React, { createContext, useState, useContext, useEffect } from 'react';

export type UserRole = 'admin' | 'donor' | 'requester' | null;

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'donor' | 'requester') => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user data (In a real app, this would come from a database)
const mockUsers = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@bloodbank.com',
    password: 'admin123',
    role: 'admin' as UserRole,
  },
  {
    id: '2',
    name: 'John Donor',
    email: 'donor@bloodbank.com',
    password: 'donor123',
    role: 'donor' as UserRole,
  },
  {
    id: '3',
    name: 'Sarah Patient',
    email: 'patient@bloodbank.com',
    password: 'patient123',
    role: 'requester' as UserRole,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check if user is already logged in via localStorage
    const storedUser = localStorage.getItem('bloodbank_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const foundUser = mockUsers.find(u => u.email === email && u.password === password);
        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          setUser(userWithoutPassword);
          localStorage.setItem('bloodbank_user', JSON.stringify(userWithoutPassword));
          resolve();
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 500);
    });
  };

  const register = async (name: string, email: string, password: string, role: 'donor' | 'requester') => {
    // Simulate API call
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Check if email is already in use
        const userExists = mockUsers.some(u => u.email === email);
        if (userExists) {
          reject(new Error('Email already in use'));
          return;
        }

        // Create new user
        const newUser = {
          id: (mockUsers.length + 1).toString(),
          name,
          email,
          password,
          role,
        };

        // Add to mock database
        mockUsers.push(newUser);

        // Log in the user
        const { password: _, ...userWithoutPassword } = newUser;
        setUser(userWithoutPassword);
        localStorage.setItem('bloodbank_user', JSON.stringify(userWithoutPassword));
        resolve();
      }, 500);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bloodbank_user');
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
