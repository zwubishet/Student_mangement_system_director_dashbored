import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    return {
      token,
      role: localStorage.getItem('role'),
      userId: localStorage.getItem('userId'),
      firstName: localStorage.getItem('firstName'),
      lastName: localStorage.getItem('lastName'),
      schoolId: localStorage.getItem('schoolId'),
    };
  });

  const login = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.roles[0]);
    localStorage.setItem('userId', data.id);
    localStorage.setItem('firstName', data.first_name || '');
    localStorage.setItem('lastName', data.last_name || '');
    localStorage.setItem('schoolId', data.school_id || '');
    setUser({
      token: data.token,
      role: data.roles[0],
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

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
