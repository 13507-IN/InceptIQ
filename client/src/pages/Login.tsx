import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup, setToken } from '../services/auth';
import { AuthContext } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login'|'signup'>('login');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getErrorMessage = (err: any) => {
    if (!err) return 'Authentication failed';
    const candidate =
      err?.response?.data?.error ??
      err?.response?.data?.message ??
      err?.message ??
      err;
    if (typeof candidate === 'string') return candidate;
    if (typeof candidate?.message === 'string') return candidate.message;
    try {
      return JSON.stringify(candidate);
    } catch {
      return 'Authentication failed';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Client-side validation for signup
      if (mode === 'signup') {
        if (!name.trim()) {
          setError('Name is required for sign up');
          setIsLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setIsLoading(false);
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
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="relative">
          {/* Background glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000"></div>
          
          {/* Form container */}
          <div className="relative bg-gray-800/50 backdrop-blur-xl p-8 rounded-2xl border border-gray-700/50 shadow-2xl">
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-emerald-300 bg-clip-text text-transparent mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-gray-400 text-sm">
                {mode === 'login' 
                  ? 'Sign in to your account to continue' 
                  : 'Join us to start validating your ideas'}
              </p>
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg"
              >
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Field (Signup only) */}
              {mode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input 
                      type="text"
                      placeholder="John Doe"
                      value={name} 
                      onChange={e => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    />
                  </div>
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input 
                    type="email"
                    placeholder="you@example.com"
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password} 
                    onChange={e => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field (Signup only) */}
              {mode === 'signup' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.45 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all disabled:opacity-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-500 hover:text-gray-300 transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button 
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Toggle Mode */}
            <motion.div 
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-gray-400 text-sm">
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                <button 
                  type="button"
                  onClick={toggleMode}
                  disabled={isLoading}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50"
                >
                  {mode === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
