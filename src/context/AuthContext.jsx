import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getMe } from '../api/client';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('ht_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('ht_token') || null);
  const [isLoading, setIsLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    async function verifyUser() {
      const storedToken = localStorage.getItem('ht_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await getMe();
        if (res.data && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem('ht_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err?.response?.data?.error || err.message);
        logout();
      } finally {
        setIsLoading(false);
      }
    }

    verifyUser();
  }, []);

  const login = useCallback(async (identifier, password) => {
    const res = await loginUser({ identifier, password });
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ht_token', newToken);
    localStorage.setItem('ht_user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const register = useCallback(async (userData) => {
    const res = await registerUser(userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('ht_token', newToken);
    localStorage.setItem('ht_user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ht_token');
    localStorage.removeItem('ht_user');
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => {
      const merged = { ...prev, ...updatedData };
      localStorage.setItem('ht_user', JSON.stringify(merged));
      return merged;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
