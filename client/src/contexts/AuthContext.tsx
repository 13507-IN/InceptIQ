import React, { createContext, useEffect, useState } from 'react';
import { getToken, setToken, getMe } from '../services/auth';

export interface User { id: string; email: string }

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  setAuth: (token: string | null) => void;
}

export const AuthContext = createContext<AuthContextValue>({ user: null, token: null, setAuth: () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setTokenState] = useState<string | null>(getToken());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      if (token) {
        try {
          const resp = await getMe(token);
          if (resp && resp.user) setUser(resp.user);
        } catch (e) {
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
      }
    };
    init();
  }, [token]);

  const setAuth = (t: string | null) => {
    setToken(t);
    setTokenState(t);
    if (!t) setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
