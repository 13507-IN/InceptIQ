import React, { createContext, useEffect, useState } from 'react';
import { getToken, setToken, getMe } from '../services/auth';

export interface User { id: string; email: string; name?: string | null; role?: 'user' | 'investor' }

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: false,
  setAuth: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(!!getToken());

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (token) {
        setLoading(true);
        try {
          const resp = await getMe(token);
          if (active && resp && resp.user) setUser(resp.user);
        } catch (e) {
          if (active) {
            setUser(null);
            setToken(null);
          }
        } finally {
          if (active) setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
      }
    };
    init();
    return () => {
      active = false;
    };
  }, [token]);

  const setAuth = (t: string | null) => {
    setToken(t);
    setTokenState(t);
    if (t) {
      setLoading(true);
    } else {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
