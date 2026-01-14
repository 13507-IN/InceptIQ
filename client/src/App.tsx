import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Analysis from './pages/Analysis';
import Results from './pages/Results';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/results/:analysisId" element={<Results />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
