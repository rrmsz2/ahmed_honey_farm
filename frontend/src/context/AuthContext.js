import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, errorMessage, tokenStore } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(tokenStore.get()));

  useEffect(() => {
    const onExpired = () => setAdmin(null);
    window.addEventListener('auth:expired', onExpired);
    if (tokenStore.get()) {
      api
        .get('/admin/me')
        .then(({ data }) => setAdmin(data))
        .catch(() => setAdmin(null))
        .finally(() => setLoading(false));
    }
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (username, password) => {
    try {
      const { data } = await api.post('/admin/login', { username, password });
      tokenStore.set(data.access_token);
      setAdmin({ username });
      return { ok: true };
    } catch (error) {
      return { ok: false, error: errorMessage(error, 'فشل تسجيل الدخول') };
    }
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setAdmin(null);
  }, []);

  /** Store a fresh token (e.g. after a password change). */
  const replaceToken = useCallback((token) => tokenStore.set(token), []);

  const value = useMemo(
    () => ({ admin, isAuthenticated: Boolean(admin), loading, login, logout, replaceToken }),
    [admin, loading, login, logout, replaceToken],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
