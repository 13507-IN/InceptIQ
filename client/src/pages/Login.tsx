import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { login, signup, setToken } from '../services/auth';
import { AuthContext } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Briefcase, Check, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ImageCarousel from '../components/ImageCarousel';

// Password strength checker utility
const getPasswordStrength = (password: string) => {
  if (!password) return { score: 0, label: '', color: '' };
  
  let score = 0;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (hasLower) score++;
  if (hasUpper) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (password.length >= 12) score++;
  
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-green-500'];
  
  return { score: Math.min(score, 5), label: labels[Math.min(score, 5)], color: colors[Math.min(score, 5)] };
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
  const isInvestorRoute = location.pathname.startsWith('/investor');
  const authRole: 'user' | 'investor' = isInvestorRoute ? 'investor' : 'user';
  const heroTitle = authRole === 'investor' ? 'Investor Portal' : 'Welcome Back';
  const heroSubtitle = authRole === 'investor'
    ? 'Sign in to discover promising projects'
    : 'Sign in to your account to continue';
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Validation states
  const passwordStrength = getPasswordStrength(password);
  const passwordsMatch = password === confirmPassword;
  const isPasswordValid = password.length >= 8;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isNameValid = name.trim().length >= 2;
  
  const isFormValid = mode === 'login' 
    ? email && password 
    : email && password && name && confirmPassword && acceptTerms && isPasswordValid && passwordsMatch && isEmailValid && isNameValid;

  useEffect(() => {
    setMode('login');
    setError(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setAcceptTerms(false);
    setTouched({});
  }, [authRole]);

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
    
    // Validation
    if (mode === 'signup') {
      if (!isNameValid) {
        setError('Name must be at least 2 characters');
        return;
      }
      if (!isEmailValid) {
        setError('Please enter a valid email address');
        return;
      }
      if (!isPasswordValid) {
        setError('Password must be at least 8 characters');
        return;
      }
      if (!passwordsMatch) {
        setError('Passwords do not match');
        return;
      }
      if (!acceptTerms) {
        setError('You must accept the terms and conditions');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please enter your email and password');
        return;
      }
    }
    
    setIsLoading(true);
    try {
      const resp = mode === 'login'
        ? await login(email, password, authRole)
        : await signup(email, password, name, authRole);
      if (resp && resp.token) {
        setToken(resp.token);
        setAuth(resp.token);
        const destination = (resp?.user?.role || authRole) === 'investor' ? '/investor/projects' : '/analysis';
        navigate(destination);
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
    <div className="min-h-screen bg-[#0a122a] flex items-center justify-center px-4 text-sand-200">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-6xl h-screen max-h-[900px] flex gap-4"
      >
        {/* Left Side - Image Carousel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex w-1/2 rounded-2xl overflow-hidden shadow-2xl border border-sand-200/10"
        >
          <ImageCarousel isInvestor={isInvestorRoute} />
        </motion.div>

        {/* Right Side - Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-1/2 flex items-center justify-center"
        >
          <div className="relative w-full max-w-md">
            {/* Background glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-sage-500 to-sand-200 rounded-2xl blur opacity-20 group-hover:opacity-100 transition duration-1000"></div>
            
            {/* Form container */}
            <div className="relative bg-ink-800/60 backdrop-blur-xl p-8 rounded-2xl border border-sand-200/10 shadow-2xl max-h-[calc(100vh-100px)] overflow-y-auto">
              {/* Header */}
              <motion.div 
                className="text-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {authRole === 'investor' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-500/15 border border-sage-400/30 text-sage-200 text-xs font-semibold mb-4">
                    <Briefcase className="h-3.5 w-3.5" />
                    Investor Login
                  </div>
                )}
                <h2 className="text-3xl font-bold bg-gradient-to-r from-sage-300 to-sand-200 bg-clip-text text-transparent mb-2">
                  {mode === 'login' ? heroTitle : 'Create Account'}
                </h2>
                <p className="text-sand-400 text-sm leading-relaxed">
                  {mode === 'login' 
                    ? heroSubtitle
                    : authRole === 'investor'
                      ? 'Create an investor account to connect with promising founders'
                      : 'Join our community to validate and grow your ideas'}
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3"
                >
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field (Signup only) */}
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-semibold text-sand-200 mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3.5 h-5 w-5 text-sand-500" />
                      <input 
                        type="text"
                        placeholder="John Doe"
                        value={name} 
                        onChange={e => setName(e.target.value)}
                        onBlur={() => setTouched({...touched, name: true})}
                        disabled={isLoading}
                        required
                        className={`w-full bg-ink-900/60 border text-sand-100 placeholder-sand-500 rounded-lg py-3 pl-10 pr-4 focus:outline-none transition-all disabled:opacity-50 ${
                          touched.name && name && !isNameValid 
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-sand-200/10 focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20'
                        }`}
                      />
                      {touched.name && isNameValid && (
                        <Check className="absolute right-3 top-3.5 h-5 w-5 text-green-400" />
                      )}
                    </div>
                    {touched.name && name && !isNameValid && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Name must be at least 2 characters
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Email Field */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <label className="block text-sm font-semibold text-sand-200 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-sand-500" />
                    <input 
                      type="email"
                      placeholder="you@example.com"
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      onBlur={() => setTouched({...touched, email: true})}
                      disabled={isLoading}
                      required
                      className={`w-full bg-ink-900/60 border text-sand-100 placeholder-sand-500 rounded-lg py-3 pl-10 pr-4 focus:outline-none transition-all disabled:opacity-50 ${
                        touched.email && email && !isEmailValid
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-sand-200/10 focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20'
                      }`}
                    />
                    {touched.email && isEmailValid && (
                      <Check className="absolute right-3 top-3.5 h-5 w-5 text-green-400" />
                    )}
                  </div>
                  {touched.email && email && !isEmailValid && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Please enter a valid email address
                    </p>
                  )}
                </motion.div>

                {/* Password Field */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-semibold text-sand-200 mb-2">
                    Password
                    {mode === 'signup' && <span className="text-sand-500 ml-1 text-xs">(8+ characters)</span>}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-sand-500" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      onBlur={() => setTouched({...touched, password: true})}
                      disabled={isLoading}
                      required
                      className={`w-full bg-ink-900/60 border text-sand-100 placeholder-sand-500 rounded-lg py-3 pl-10 pr-12 focus:outline-none transition-all disabled:opacity-50 ${
                        touched.password && mode === 'signup' && password && !isPasswordValid
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                          : 'border-sand-200/10 focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-sand-500 hover:text-sand-300 transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password strength indicator (signup only) */}
                  {mode === 'signup' && password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-sand-400">Password strength:</span>
                        <span className={`text-xs font-semibold ${
                          passwordStrength.score === 5 ? 'text-green-400' :
                          passwordStrength.score === 4 ? 'text-lime-400' :
                          passwordStrength.score === 3 ? 'text-yellow-400' :
                          passwordStrength.score === 2 ? 'text-orange-400' :
                          'text-red-400'
                        }`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-ink-800 rounded-full h-1.5 overflow-hidden">
                        <motion.div 
                          className={`h-full ${passwordStrength.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-sand-400">
                        Include uppercase, lowercase, numbers, and special characters
                      </p>
                    </div>
                  )}
                  
                  {touched.password && mode === 'signup' && password && !isPasswordValid && (
                    <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Password must be at least 8 characters
                    </p>
                  )}
                </motion.div>

                {/* Confirm Password Field (Signup only) */}
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.45 }}
                  >
                    <label className="block text-sm font-semibold text-sand-200 mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-sand-500" />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        value={confirmPassword} 
                        onChange={e => setConfirmPassword(e.target.value)}
                        onBlur={() => setTouched({...touched, confirmPassword: true})}
                        disabled={isLoading}
                        required
                        className={`w-full bg-ink-900/60 border text-sand-100 placeholder-sand-500 rounded-lg py-3 pl-10 pr-12 focus:outline-none transition-all disabled:opacity-50 ${
                          touched.confirmPassword && confirmPassword && !passwordsMatch
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                            : 'border-sand-200/10 focus:border-sage-400 focus:ring-2 focus:ring-sage-400/20'
                        }`}
                      />
                      {touched.confirmPassword && passwordsMatch && confirmPassword && (
                        <Check className="absolute right-12 top-3.5 h-5 w-5 text-green-400" />
                      )}
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3.5 text-sand-500 hover:text-sand-300 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {touched.confirmPassword && confirmPassword && !passwordsMatch && (
                      <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Passwords do not match
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Terms & Conditions (Signup only) */}
                {mode === 'signup' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-start gap-3 p-4 bg-sage-500/5 border border-sage-500/20 rounded-lg"
                  >
                    <input 
                      type="checkbox"
                      id="terms"
                      checked={acceptTerms}
                      onChange={e => setAcceptTerms(e.target.checked)}
                      disabled={isLoading}
                      className="w-5 h-5 mt-0.5 cursor-pointer accent-sage-400"
                    />
                    <label htmlFor="terms" className="text-xs text-sand-400 cursor-pointer flex-1 leading-relaxed">
                      I agree to the <Link to="/terms" className="text-sage-300 hover:text-sage-200 underline">Terms of Service</Link> and <Link to="/privacy" className="text-sage-300 hover:text-sage-200 underline">Privacy Policy</Link>
                    </label>
                  </motion.div>
                )}

                {/* Submit Button */}
                <motion.button 
                  type="submit"
                  disabled={isLoading || (mode === 'signup' && !isFormValid) || (mode === 'login' && (!email || !password))}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-8 bg-gradient-to-r from-sage-500 to-sage-400 hover:from-sage-400 hover:to-sage-300 disabled:from-sage-600 disabled:to-sage-500 text-ink-900 font-semibold py-3.5 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-ink-900 border-t-transparent rounded-full"></div>
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
                className="mt-8 pt-6 border-t border-sand-200/10 space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
              >
                <p className="text-center text-sand-400 text-sm">
                  {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    disabled={isLoading}
                    className="text-sage-300 hover:text-sage-200 font-semibold transition-colors disabled:opacity-50"
                  >
                    {mode === 'login' ? 'Create one' : 'Sign in'}
                  </button>
                </p>
                <div className="text-center text-xs text-sand-500 space-y-2">
                  {authRole === 'investor' ? (
                    <div>
                      Looking for the founder portal?{'\u00A0'}
                      <Link to="/login" className="text-sage-300 hover:text-sage-200 font-semibold transition-colors">
                        Sign in as founder
                      </Link>
                    </div>
                  ) : (
                    <div>
                      Are you an investor?{'\u00A0'}
                      <Link to="/investor/login" className="text-sage-300 hover:text-sage-200 font-semibold transition-colors">
                        Investor portal
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
