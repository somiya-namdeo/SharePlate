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
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/food-safety" element={<FoodSafety />} />
        <Route path="/nlp" element={<NLPIntelligence />} />

        <Route path="/matching" element={<SmartMatching />} />
        <Route path="/logistics" element={<MapLogistics />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/requests" element={<NGORequests />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
