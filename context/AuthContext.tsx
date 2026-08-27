import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string) => boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount with error handling
    const storedUser = localStorage.getItem('educlean_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.email) {
            setUser(parsedUser);
        }
      } catch (error) {
        console.error("Failed to parse user session, clearing storage:", error);
        localStorage.removeItem('educlean_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string): boolean => {
    let newUser: User | null = null;

    if (email === 'admin@prof.com') {
      newUser = { email, name: 'Prof. Anderson', role: 'professor' };
    } else if (email === 'aluno@test.com') {
      newUser = { email, name: 'Aluno Demo', role: 'student' };
    }

    if (newUser) {
      setUser(newUser);
      localStorage.setItem('educlean_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('educlean_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};