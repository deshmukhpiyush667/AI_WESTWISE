import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  loginApi,
  registerApi,
  getMeApi,
  forgotPasswordApi,
  resetPasswordApi,
  changePasswordApi,
} from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('wastewise_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details on boot if token exists
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const userData = await getMeApi(token);
        setUser(userData);
      } catch (err) {
        console.warn('Failed to validate session token:', err.message);
        localStorage.removeItem('wastewise_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('wastewise_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const register = async (email, password, fullName) => {
    const data = await registerApi(email, password, fullName);
    localStorage.setItem('wastewise_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('wastewise_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const userData = await getMeApi(token);
      setUser(userData);
    } catch (err) {
      console.warn('Could not refresh user:', err.message);
    }
  };

  const requestPasswordReset = async (email) => {
    return await forgotPasswordApi(email);
  };

  const executePasswordReset = async (token, newPassword) => {
    return await resetPasswordApi(token, newPassword);
  };

  const updatePassword = async (oldPassword, newPassword) => {
    if (!token) throw new Error('Not authenticated');
    return await changePasswordApi(token, oldPassword, newPassword);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshUser,
        requestPasswordReset,
        executePasswordReset,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
