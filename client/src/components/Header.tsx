import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { Brain, Home, FileText, Menu, X, User } from 'lucide-react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg border-b border-gray-700/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/50 transition-all"
            >
              <Brain className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                inceptIQ
              </h1>
              <p className="text-xs text-gray-400">AI-Powered Analysis</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/')
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/analysis"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive('/analysis')
                  ? 'text-blue-400 bg-blue-500/10 border border-blue-500/30'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>New Analysis</span>
            </Link>
          </nav>
          {/* Right side: auth */}
          <div className="flex items-center space-x-4">
            {/** Auth status */}
            <AuthStatus />
            <div className="md:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white p-2 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 border-t border-gray-700/50"
          >
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </div>
            </Link>
            
            <Link
              to="/analysis"
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analysis')
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>New Analysis</span>
              </div>
            </Link>

            {/* Mobile auth section */}
            <MobileAuthStatus mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          </motion.div>
        )}
      </div>
    </header>
  );
};

const AuthStatus: React.FC = () => {
  const { user, setAuth } = useContext<AuthContextValue>(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('iv_token');
    navigate('/');
  };

  if (user) {
    return (
      <motion.div 
        className="hidden md:flex items-center space-x-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-sm text-gray-300">{user.email}</div>
        <Link
          to="/profile"
          className="text-sm px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded border border-blue-600/30 hover:border-blue-600/50 transition-all flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          onClick={logout} 
          className="text-sm px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
        >
          Logout
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="hidden md:flex items-center space-x-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Link 
        to="/login" 
        className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Login
      </Link>
    </motion.div>
  );
};

interface MobileAuthStatusProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const MobileAuthStatus: React.FC<MobileAuthStatusProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { user, setAuth } = useContext<AuthContextValue>(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('iv_token');
    setMobileMenuOpen(false);
    navigate('/');
  };

  if (user) {
    return (
      <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
        <div className="text-sm text-gray-400 px-3">{user.email}</div>
        <Link
          to="/profile"
          onClick={() => setMobileMenuOpen(false)}
          className="block px-3 py-2 bg-blue-600/20 text-blue-300 rounded border border-blue-600/30 transition-colors flex items-center gap-2"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 bg-red-600/20 text-red-300 rounded border border-red-600/30 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-700/50">
      <Link
        to="/login"
        onClick={() => setMobileMenuOpen(false)}
        className="block px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Login
      </Link>
    </div>
  );
};

export default Header;
