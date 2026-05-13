import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Login from './pages/Login';
import Home from './pages/Home';
import FounderDashboard from './pages/FounderDashboard';
import Analysis from './pages/Analysis';
import AnalysisStreaming from './pages/AnalysisStreaming';
import Results from './pages/Results';
import Compare from './pages/Compare';
import Profile from './pages/Profile';
import Community from './pages/Community';
import CommunityPublish from './pages/CommunityPublish';
import CompetitorTracker from './pages/CompetitorTracker';
import Pricing from './pages/Pricing';
import InvestorDirectory from './pages/InvestorDirectory';
import InvestorLanding from './pages/InvestorLanding';
import Documentation from './pages/Documentation';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import SharedResults from './pages/SharedResults';
import ScoreTrends from './pages/ScoreTrends';
import Notifications from './pages/Notifications';
import './App.css';

const isInvestorPath = (path: string) => path === '/investor' || path.startsWith('/investor/');

const InvestorGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const path = location.pathname;

  if (user?.role === 'investor') {
    if (!isInvestorPath(path)) {
      return <Navigate to="/investor/projects" replace />;
    }
    if (path === '/investor/login') {
      return <Navigate to="/investor/projects" replace />;
    }
  }

  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <ToastProvider>
            <InvestorGuard>
              <div className="min-h-screen bg-gradient-to-b from-[#0a122a] via-[#111b36] to-[#0a122a] flex flex-col text-sand-200">
                <Header />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route
                      path="/analysis"
                      element={
                        <ProtectedRoute>
                          <Analysis />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analysis/stream"
                      element={
                        <ProtectedRoute>
                          <AnalysisStreaming />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/results/:analysisId" element={<Results />} />
                    <Route
                      path="/compare"
                      element={
                        <ProtectedRoute>
                          <Compare />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/login" element={<Login key="user-login" />} />
                    <Route path="/investor/login" element={<Login key="investor-login" />} />
                    <Route
                      path="/founder"
                      element={
                        <ProtectedRoute>
                          <FounderDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/founder/analysis"
                      element={
                        <ProtectedRoute>
                          <Analysis />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/founder/stream"
                      element={
                        <ProtectedRoute>
                          <AnalysisStreaming />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/investor" element={<InvestorLanding />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/investor-directory" element={<InvestorDirectory />} />
                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/community" element={<Community />} />
                    <Route path="/community/publish" element={<CommunityPublish />} />
                    <Route
                      path="/investor/projects"
                      element={
                        <ProtectedRoute allowedRoles={['investor']}>
                          <Community variant="projects" />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/documentation" element={<Documentation />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route
                      path="/notifications"
                      element={
                        <ProtectedRoute>
                          <Notifications />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/share/:token" element={<SharedResults />} />
                    <Route
                      path="/score-trends"
                      element={
                        <ProtectedRoute>
                          <ScoreTrends />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/competitors"
                      element={
                        <ProtectedRoute>
                          <CompetitorTracker />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
                <Footer />
              </div>
            </InvestorGuard>
          </ToastProvider>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
