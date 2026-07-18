import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Donations } from './pages/Donations';
import { FoodSafety } from './pages/FoodSafety';
import { NLPIntelligence } from './pages/NLPIntelligence';

import { SmartMatching } from './pages/SmartMatching';
import { MapLogistics } from './pages/MapLogistics';
import { Analytics } from './pages/Analytics';
import { NGORequests } from './pages/NGORequests';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant"
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/donations" element={<ProtectedRoute allowedRoles={['donor']}><Donations /></ProtectedRoute>} />
        <Route path="/food-safety" element={<ProtectedRoute allowedRoles={['donor']}><FoodSafety /></ProtectedRoute>} />
        <Route path="/nlp" element={<ProtectedRoute allowedRoles={['donor']}><NLPIntelligence /></ProtectedRoute>} />

        <Route path="/matching" element={<ProtectedRoute><SmartMatching /></ProtectedRoute>} />
        <Route path="/logistics" element={<ProtectedRoute><MapLogistics /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/requests" element={<ProtectedRoute allowedRoles={['ngo']}><NGORequests /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
