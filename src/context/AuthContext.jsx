import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

const parseToken = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now() ? payload : null;
  } catch {
    return null;
  }
};

const readStorage = () => {
  const token = localStorage.getItem('token');
  if (!token || !parseToken(token)) {
    localStorage.clear();
    return null;
  }
  return {
    token,
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
    schoolId: localStorage.getItem('schoolId'),
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readStorage);

  // Auto-logout when token expires
  useEffect(() => {
    if (!user?.token) return;
    const payload = parseToken(user.token);
    if (!payload) { setUser(null); return; }
    const ms = payload.exp * 1000 - Date.now();
    const timer = setTimeout(() => { localStorage.clear(); setUser(null); }, ms);
    return () => clearTimeout(timer);
  }, [user?.token]);

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.roles?.[0] ?? data.role);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('firstName', data.first_name || '');
    localStorage.setItem('lastName', data.last_name || '');
    localStorage.setItem('schoolId', data.school_id || '');
    setUser({
      token: data.token,
      role: data.roles?.[0] ?? data.role,
      userId: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      schoolId: data.school_id,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.clear();
    setUser(null);
  }, []);

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
