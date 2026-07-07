import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { SignIn } from './pages/SignIn';
import { SignUp } from './pages/SignUp';
import { Dashboard } from './pages/Dashboard';
import { Donations } from './pages/Donations';
import { FoodSafety } from './pages/FoodSafety';

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
        {/* Placeholder demo routes to avoid 404s */}
        <Route path="/nlp-demo" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
