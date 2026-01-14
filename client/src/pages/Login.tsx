import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, setToken } from '../services/auth';
import { AuthContext } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      // Client-side validation for signup
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Name is required for sign up');
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          return;
        }
      }

      const fn = mode === 'login' ? login : signup;
      const resp = mode === 'login' ? await fn(email, password) : await fn(email, password, name);
      if (resp && resp.token) {
        setToken(resp.token);
        setAuth(resp.token);
        navigate('/analysis');
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Authentication failed');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-4">{mode === 'login' ? 'Login' : 'Sign up'}</h2>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <form onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <>
            <label className="block mb-2 text-sm">Name</label>
            <input className="form-input mb-3 w-full" value={name} onChange={e=>setName(e.target.value)} />
          </>
        )}
        <label className="block mb-2 text-sm">Email</label>
        <input className="form-input mb-3 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block mb-2 text-sm">Password</label>
        <input type="password" className="form-input mb-2 w-full" value={password} onChange={e=>setPassword(e.target.value)} />
        {mode === 'signup' && (
          <>
            <label className="block mb-2 text-sm">Confirm Password</label>
            <input type="password" className="form-input mb-4 w-full" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />
          </>
        )}
        <div className="flex items-center justify-between">
          <button className="btn-primary" type="submit">{mode === 'login' ? 'Login' : 'Create account'}</button>
          <button type="button" className="text-sm text-gray-600 underline" onClick={()=>setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create an account' : 'Have an account? Login'}</button>
        </div>
      </form>
    </div>
  );
};

export default Login;
