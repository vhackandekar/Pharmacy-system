import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, password) => {
    const res = await apiLogin({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  // Dev helper: auto-login on localhost when no token present
  useEffect(() => {
    try {
      if (!token && window?.location?.hostname === 'localhost') {
        const demoToken = 'demo-token-123';
        const demoUser = { id: '1', name: 'Admin', email: 'admin@pharmacy.com', role: 'ADMIN' };
        localStorage.setItem('token', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        setToken(demoToken);
        setUser(demoUser);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
