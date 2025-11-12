// AuthContext - Authentication helper

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

function normalizeUser(user) {
  if (!user) return null;
  const role = typeof user.role === 'string' ? user.role.toLowerCase() : user.role;
  return { ...user, role };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const setNormalizedUser = value => {
    if (typeof value === 'function') {
      setUser(prev => normalizeUser(value(prev)));
    } else {
      setUser(normalizeUser(value));
    }
  };

  useEffect(() => {
    api
      .me()
      .then(u => setNormalizedUser(u))
      .catch(() => setNormalizedUser(null))
      .finally(() => setReady(true));
    }, []);

  const login = async (email, password) => {
    const u = await api.login(email, password);
    const normalized = normalizeUser(u);
    setNormalizedUser(normalized);
    return normalized;
  };

  const register = async payload => {
    const u = await api.register(payload);
    const normalized = normalizeUser(u);
    setNormalizedUser(normalized);
    return normalized;
  };

  const logout = async () => {
    await api.logout();
    setNormalizedUser(null);
  };

  const updateProfile = async payload => {
    const updated = await api.updateMe(payload);
    const normalized = normalizeUser(updated);
    setNormalizedUser(normalized);
    return normalized;
  };

   return (
      <AuthCtx.Provider value={{ user, setUser: setNormalizedUser, ready, login, register, logout, updateProfile }}>
        {children}
      </AuthCtx.Provider>
  );
}