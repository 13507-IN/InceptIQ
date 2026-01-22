import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, token } = useContext(AuthContext);

  // If no token or user, show sign in message
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-700 rounded-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            
            <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
            
            <p className="text-gray-300 mb-6">
              Please sign in to continue accessing this page.
            </p>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-200">
                You need to be logged in to view your profile and previous research.
              </p>
            </div>
            
            <a
              href="/login"
              className="inline-block w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
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

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
