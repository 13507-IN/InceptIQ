import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const signup = async (email: string, password: string, name?: string) => {
  const resp = await axios.post(`${API_BASE}/auth/signup`, { email, password, name });
  return resp.data;
};

export const login = async (email: string, password: string) => {
  const resp = await axios.post(`${API_BASE}/auth/login`, { email, password });
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
