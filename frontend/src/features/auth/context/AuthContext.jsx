import React, { createContext, useState, useEffect } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, setPassword as apiSetPassword } from '@/shared/api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-fetch user session on initial load
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // This will send the httpOnly cookie automatically
        const { data } = await getMe();
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const login = async (credentials) => {
    // We expect { success: true }
    await apiLogin(credentials);
    // After successful login, fetch the user's role from /me
    const { data } = await getMe();
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error('Logout failed', err);
    }
    setUser(null);
  };

  const completeSetPassword = async (credentials) => {
    await apiSetPassword(credentials);
    const { data } = await getMe();
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, completeSetPassword, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
