import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'user' | 'investor'>;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, loading } = useContext(AuthContext);
  const effectiveRole = user?.role || 'user';
  const roleAllowed = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(effectiveRole);
  const loginPath = allowedRoles && allowedRoles.length === 1 && allowedRoles[0] === 'investor' ? '/investor/login' : '/login';

  if (loading) {
    return <LoadingSpinner fullScreen message="Checking your session..." />;
  }

  // If no token or user, show sign in message
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            
            <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
            
            <p className="text-gray-300 mb-6">
              Please sign in to continue accessing this page.
            </p>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-200">
                You need to be logged in to view your profile and previous research.
              </p>
            </div>
            
            <a
              href={loginPath}
              className="inline-block w-full bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Sign In
            </a>
            
            <a
              href="/"
              className="inline-block w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!roleAllowed) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />

            <h1 className="text-3xl font-bold text-white mb-2">Access Restricted</h1>

            <p className="text-gray-300 mb-6">
              This page is only available for {allowedRoles?.includes('investor') ? 'investor' : 'authorized'} accounts.
            </p>

            <div className="bg-gradient-to-r from-blue-500/20 to-emerald-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-200">
                You are currently signed in as {effectiveRole}. Please use the correct login portal.
              </p>
            </div>

            <a
              href={loginPath}
              className="inline-block w-full bg-gradient-to-r from-blue-500 to-emerald-600 hover:from-blue-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Go to Sign In
            </a>

            <a
              href="/"
              className="inline-block w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
            >
              Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;

