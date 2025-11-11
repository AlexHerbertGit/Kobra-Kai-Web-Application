// AuthContext - Authentication helper

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null)).finally(() => setReady(true));
  }, []);

  const login = async (email, password) => { const u = await api.login(email, password); setUser(u); return u; };
  const register = async (payload) => { const u = await api.register(payload); setUser(u); return u; };
  const logout = async () => { await api.logout(); setUser(null); };
  const updateProfile = async (payload) => {
    const updated = await api.updateMe(payload);
    setUser(updated);
    return updated;
  };

   return <AuthCtx.Provider value={{ user, setUser, ready, login, register, logout, updateProfile }}>{children}</AuthCtx.Provider>;
}