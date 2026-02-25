import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { login as apiLogin } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isInitializing, setIsInitializing] = useState(!token); // Track if we're auto-logging in

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
    const autoLogin = async () => {
      try {
        if (!token && window?.location?.hostname === 'localhost') {
          try {
            console.log('🔐 Attempting auto-login with admin@pharmacy.com...');
            // Try to login with demo credentials
            const res = await apiLogin({ email: 'admin@pharmacy.com', password: 'admin123' });
            const { token: t, user: u } = res.data;
            localStorage.setItem('token', t);
            localStorage.setItem('user', JSON.stringify(u));
            setToken(t);
            setUser(u);
            console.log('✅ Auto-login successful with real JWT');
          } catch (loginError) {
            console.error('❌ Auto-login failed:', loginError.message);
            console.error('Full error:', loginError);
            // NO FALLBACK - require real login
            console.warn('⚠️ Auto-login failed. Please manually login to proceed.');
            setIsInitializing(false);
            return;
          }
        }
        setIsInitializing(false);
      } catch (e) {
        console.error('Auth initialization error:', e);
        setIsInitializing(false);
      }
    };

    autoLogin();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isInitializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
