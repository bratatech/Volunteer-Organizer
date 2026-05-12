import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Landing from './pages/Landing';
import VolunteerSignup from './pages/VolunteerSignup';
import VolunteerLogin from './pages/VolunteerLogin';
import OrganizerSignup from './pages/OrganizerSignup';
import OrganizerLogin from './pages/OrganizerLogin';
import VolunteerDashboard from './pages/VolunteerDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="text-2xl font-semibold text-primary-600">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        
        {/* Volunteer Routes */}
        <Route 
          path="/volunteer/signup" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <VolunteerSignup />} 
        />
        <Route 
          path="/volunteer/login" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <VolunteerLogin setUser={setUser} />} 
        />
        <Route 
          path="/volunteer/dashboard" 
          element={user && user.role === 'volunteer' ? <VolunteerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/volunteer/login" />} 
        />
        
        {/* Organizer Routes */}
        <Route 
          path="/organizer/signup" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <OrganizerSignup />} 
        />
        <Route 
          path="/organizer/login" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <OrganizerLogin setUser={setUser} />} 
        />
        <Route 
          path="/organizer/dashboard" 
          element={user && user.role === 'organizer' ? <OrganizerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/organizer/login" />} 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
