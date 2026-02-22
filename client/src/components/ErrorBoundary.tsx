import React, { ReactNode, ErrorInfo } from 'react';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-ink-900 to-ink-800 text-sand-200 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-full mb-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Something Went Wrong</h1>
            <p className="text-sand-400 mb-2">
              We encountered an unexpected error. Please try refreshing the page or return to the home page.
            </p>
            {this.state.error && (
              <p className="text-sm text-sand-500 mt-4 p-3 bg-ink-800/60 rounded font-mono">
                {this.state.error.message}
              </p>
            )}
            <div className="flex gap-4 justify-center mt-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-2 bg-sage-500 hover:bg-sage-400 text-ink-900 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-ink-700 hover:bg-ink-600 rounded-lg transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
