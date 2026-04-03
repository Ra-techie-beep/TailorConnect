import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './auth/Signup';
import Login from './auth/Login';
import ProfileSetup from './auth/ProfileSetup';
import CustomerProfile from './Profiles/CustomerProfile';
import CustomerDashboard from './dashboards/CustomerDashboard';
import TailorDashboard from './dashboards/TailorDashboard';
import TailorProfile from './Profiles/TailorProfile';
import TailorReview from './Profiles/TailorReview';
import FindTailor from './Profiles/FindTailor';
import CustomerTailorView from './Profiles/CustomerTailorView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/customer-profile" element={<CustomerProfile />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        <Route path="/tailor-dashboard" element={<TailorDashboard />} />
        <Route path="/tailor-profile" element={<TailorProfile />} />
        <Route path="/tailor-view/:id" element={<CustomerTailorView />} />
        <Route path="/tailor-review" element={<TailorReview />} />
        <Route path="/find-tailors" element={<FindTailor />} />
      </Routes>
    </Router>
  );
}

export default App;
