import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Donations } from './pages/Donations';
import { FoodSafety } from './pages/FoodSafety';
import { NLPIntelligence } from './pages/NLPIntelligence';
import { DemandForecasting } from './pages/DemandForecasting';
import { SmartMatching } from './pages/SmartMatching';
import { MapLogistics } from './pages/MapLogistics';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/food-safety" element={<FoodSafety />} />
        <Route path="/nlp" element={<NLPIntelligence />} />
        <Route path="/forecasting" element={<DemandForecasting />} />
        <Route path="/matching" element={<SmartMatching />} />
        <Route path="/logistics" element={<MapLogistics />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
