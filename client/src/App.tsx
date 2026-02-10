import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import Profile from './pages/Profile';
import Community from './pages/Community';
import CommunityPublish from './pages/CommunityPublish';
import Pricing from './pages/Pricing';
import InvestorDirectory from './pages/InvestorDirectory';
import Documentation from './pages/Documentation';
import FAQ from './pages/FAQ';
import Support from './pages/Support';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import './App.css';

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-b from-[#0b0f1a] via-[#0f172a] to-[#0b0f1a] flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/results/:analysisId" element={<Results />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/investors" element={<InvestorDirectory />} />
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
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/support" element={<Support />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/cookies" element={<CookiePolicy />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
