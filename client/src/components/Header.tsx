import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { Brain, Home, FileText } from 'lucide-react';

const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="p-2 bg-primary-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                inceptIQ
              </h1>
              <p className="text-xs text-gray-500">Powered by AI</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            
            <Link
              to="/analysis"
              className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analysis')
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
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
              <button className="text-gray-600 hover:text-gray-900 p-2">
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
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
      <div className="flex items-center space-x-3">
        <div className="text-sm text-gray-700">{user.email}</div>
        <button onClick={logout} className="text-sm px-3 py-1 bg-gray-100 rounded">Logout</button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <Link to="/login" className="text-sm px-3 py-1 bg-primary-50 text-primary-700 rounded">Login</Link>
    </div>
  );
};

export default Header;
