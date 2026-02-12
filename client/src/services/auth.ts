import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
type UserRole = 'user' | 'investor';

export const signup = async (email: string, password: string, name?: string, role?: UserRole) => {
  const payload: { email: string; password: string; name?: string; role?: UserRole } = { email, password };
  if (name) payload.name = name;
  if (role) payload.role = role;
  const endpoint = role === 'investor' ? '/auth/investor/signup' : '/auth/signup';
  const resp = await axios.post(`${API_BASE}${endpoint}`, payload);
  return resp.data;
};

export const login = async (email: string, password: string, role?: UserRole) => {
  const payload: { email: string; password: string; role?: UserRole } = { email, password };
  if (role) payload.role = role;
  const endpoint = role === 'investor' ? '/auth/investor/login' : '/auth/login';
  const resp = await axios.post(`${API_BASE}${endpoint}`, payload);
  return resp.data;
};

export const getMe = async (token: string) => {
  const resp = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return resp.data;
};

export const setToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('iv_token', token);
  } else {
    localStorage.removeItem('iv_token');
  }
};

export const getToken = (): string | null => {
  return localStorage.getItem('iv_token');
};
