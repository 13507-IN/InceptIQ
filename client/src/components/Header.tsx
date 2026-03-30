import React, { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext, AuthContextValue } from '../contexts/AuthContext';
import { Home, FileText, Menu, X, User, Users, BadgeDollarSign, Briefcase, BarChart2, Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useContext<AuthContextValue>(AuthContext);
  const isInvestorRoute = location.pathname === '/investor' || location.pathname.startsWith('/investor/');
  const isInvestorView = user?.role === 'investor' || isInvestorRoute;
  const logoLink = isInvestorView ? '/investor' : '/';

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0a122a]/90 shadow-lg border-b border-sand-200/10 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to={logoLink} className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="p-2 rounded-xl bg-sand-100/10 border border-sand-100/10 group-hover:border-sage-400/40 group-hover:shadow-lg group-hover:shadow-sage-500/30 transition-all"
            >
              <img src="/logo-main.png" alt="InceptIQ" className="h-7 w-7 object-contain" />
            </motion.div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-sand-100">
                InceptIQ
              </h1>
              <p className="text-xs text-sand-400">AI-Powered Analysis</p>
            </div>
          </Link>

          {/* Navigation - Only show if authenticated */}
          {user && (
            <nav className="hidden md:flex space-x-6">
            {isInvestorView ? (
              <>
                <Link
                  to="/investor"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/investor')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Investor Home</span>
                </Link>
                <Link
                  to="/investor/projects"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/investor/projects')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Projects</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/founder"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/founder')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/founder/analysis"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/founder/analysis')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <FileText className="h-4 w-4" />
                  <span>New Analysis</span>
                </Link>
                <Link
                  to="/compare"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/compare')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <BarChart2 className="h-4 w-4" />
                  <span>Compare</span>
                </Link>
                <Link
                  to="/community"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${isActive('/community')
                      ? 'text-sand-100 bg-sage-500/20 border border-sage-400/40'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Community</span>
                </Link>
              </>
            )}
          </nav>
          )}
          {/* Right side: auth */}
          <div className="flex items-center space-x-4">
            {/** Auth status */}
            <AuthStatus isInvestorView={isInvestorView} />
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-sand-300 hover:text-sand-100 p-2 transition-colors"
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

        {/* Mobile Menu - Only show if authenticated */}
        {mobileMenuOpen && user && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden pb-4 border-t border-sand-200/10"
          >
            {isInvestorView ? (
              <>
                <Link
                  to="/investor"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/investor')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Investor Home</span>
                  </div>
                </Link>
                <Link
                  to="/investor/projects"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/investor/projects')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Projects</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/founder"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/founder')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <Link
                  to="/founder/analysis"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/founder/analysis')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>New Analysis</span>
                  </div>
                </Link>
                <Link
                  to="/compare"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/compare')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <BarChart2 className="h-4 w-4" />
                    <span>Compare</span>
                  </div>
                </Link>
                <Link
                  to="/community"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/community')
                      ? 'text-sand-100 bg-sage-500/20'
                      : 'text-sand-300 hover:text-sand-100 hover:bg-sand-100/5'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>Community</span>
                  </div>
                </Link>
              </>
            )}

            {/* Mobile auth section */}
            <MobileAuthStatus
              mobileMenuOpen={mobileMenuOpen}
              setMobileMenuOpen={setMobileMenuOpen}
              isInvestorView={isInvestorView}
            />
          </motion.div>
        )}
      </div>
    </header>
  );
};

const AuthStatus: React.FC<{ isInvestorView: boolean }> = ({ isInvestorView }) => {
  const { user, setAuth } = useContext<AuthContextValue>(AuthContext);
  const navigate = useNavigate();
  const { unreadCount, clearUnread, requestSubscription, isSubscribed } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    // Automatically request permission on login/entry
    if (user && !isSubscribed) {
      requestSubscription().catch(() => {});
    }
  }, [user, isSubscribed, requestSubscription]);

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
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-1.5 text-sand-300 hover:text-sand-100 transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-[#0a122a]"></span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showDropdown && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute right-0 mt-2 w-72 bg-[#111b36] border border-sand-200/10 rounded-lg shadow-xl overflow-hidden z-50 text-left"
            >
              <div className="p-3 border-b border-sand-200/10 flex justify-between items-center bg-[#0a122a]">
                <h3 className="text-sm font-semibold text-sand-100">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => {
                      clearUnread();
                      setShowDropdown(false);
                    }} 
                    className="text-xs text-sage-400 hover:text-sage-300 transition-colors"
                  >
                    Mark as read
                  </button>
                )}
              </div>
              <div className="p-2 max-h-64 overflow-y-auto">
                {unreadCount > 0 ? (
                  <div 
                    onClick={() => {
                      clearUnread();
                      setShowDropdown(false);
                      navigate('/community');
                    }}
                    className="p-3 bg-sage-500/10 hover:bg-sage-500/20 rounded cursor-pointer transition-colors border-l-2 border-sage-500"
                  >
                    <p className="text-sm text-sand-100">You have {unreadCount} new founder match{unreadCount > 1 ? 'es' : ''}!</p>
                    <p className="text-xs text-sand-400 mt-1">Click to view in community.</p>
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-sand-400">
                    No new notifications
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
        <div className="text-sm text-sand-300">{user.email}</div>
        {user.role !== 'investor' && !isInvestorView && (
          <Link
            to="/profile"
            className="text-sm px-3 py-2 bg-sage-500/15 hover:bg-sage-500/25 text-sand-100 rounded border border-sage-400/40 hover:border-sage-300/60 transition-all flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={logout}
          className="text-sm px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded transition-colors"
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
      {isInvestorView ? (
        <Link
          to="/investor/login"
          className="text-sm px-4 py-2 bg-sage-500 text-ink-900 rounded hover:bg-sage-400 transition-colors"
        >
          Investor Login
        </Link>
      ) : (
        <>
          <Link
            to="/login"
            className="text-sm px-4 py-2 bg-sage-500 text-ink-900 rounded hover:bg-sage-400 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/investor/login"
            className="text-sm px-4 py-2 bg-sage-500/15 text-sand-100 rounded border border-sage-400/40 hover:bg-sage-500/25 transition-colors"
          >
            Investor Login
          </Link>
        </>
      )}
    </motion.div>
  );
};

interface MobileAuthStatusProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isInvestorView: boolean;
}

const MobileAuthStatus: React.FC<MobileAuthStatusProps> = ({ mobileMenuOpen, setMobileMenuOpen, isInvestorView }) => {
  const { user, setAuth } = useContext<AuthContextValue>(AuthContext);
  const navigate = useNavigate();
  const { unreadCount, clearUnread, requestSubscription, isSubscribed } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);

  React.useEffect(() => {
    if (user && !isSubscribed) {
      requestSubscription().catch(() => {});
    }
  }, [user, isSubscribed, requestSubscription]);

  const logout = () => {
    setAuth(null);
    localStorage.removeItem('iv_token');
    setMobileMenuOpen(false);
    navigate('/');
  };

  if (user) {
    return (
      <div className="mt-4 pt-4 border-t border-sand-200/10 space-y-2">
        <div className="flex flex-col space-y-2 px-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-sand-400">{user.email}</div>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="relative p-1.5 text-sand-300 hover:text-sand-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-green-500 rounded-full border-2 border-[#0a122a]"></span>
              )}
            </button>
          </div>
          
          {/* Mobile Notification Dropdown embedded */}
          {showDropdown && (
            <div className="bg-[#0a122a]/50 rounded border border-sand-200/10 p-2 mt-2">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-xs font-semibold text-sand-300">Notifications</span>
              </div>
              {unreadCount > 0 ? (
                <div 
                  onClick={() => {
                    clearUnread();
                    setMobileMenuOpen(false);
                    navigate('/community');
                  }}
                  className="p-3 bg-sage-500/10 rounded border-l-2 border-sage-500 cursor-pointer"
                >
                  <p className="text-sm text-sand-100">You have {unreadCount} new match{unreadCount > 1 ? 'es' : ''}!</p>
                </div>
              ) : (
                <p className="text-xs text-sand-400 text-center py-2">No new notifications</p>
              )}
            </div>
          )}
        </div>
        {user.role !== 'investor' && !isInvestorView && (
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2 bg-sage-500/15 text-sand-100 rounded border border-sage-400/40 transition-colors flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Profile
          </Link>
        )}
        <button
          onClick={logout}
          className="w-full text-left px-3 py-2 bg-rose-600/20 text-rose-100 rounded border border-rose-600/30 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-sand-200/10">
      {isInvestorView ? (
        <Link
          to="/investor/login"
          onClick={() => setMobileMenuOpen(false)}
          className="block px-3 py-2 bg-sage-500 text-ink-900 rounded hover:bg-sage-400 transition-colors"
        >
          Investor Login
        </Link>
      ) : (
        <>
          <Link
            to="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 bg-sage-500 text-ink-900 rounded hover:bg-sage-400 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/investor/login"
            onClick={() => setMobileMenuOpen(false)}
            className="block mt-2 px-3 py-2 bg-sage-500/15 text-sand-100 rounded border border-sage-400/40 hover:bg-sage-500/25 transition-colors"
          >
            Investor Login
          </Link>
        </>
      )}
    </div>
  );
};

export default Header;
