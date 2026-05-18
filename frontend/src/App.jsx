import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
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
        
        {/* Unified Authentication Routes */}
        <Route 
          path="/login" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login setUser={setUser} />} 
        />
        <Route 
          path="/signup" 
          element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Signup />} 
        />

        {/* Legacy Backwards Compatibility Redirects */}
        <Route path="/volunteer/signup" element={<Navigate to="/signup" state={{ role: 'volunteer' }} replace />} />
        <Route path="/volunteer/login" element={<Navigate to="/login" state={{ role: 'volunteer' }} replace />} />
        <Route path="/organizer/signup" element={<Navigate to="/signup" state={{ role: 'organizer' }} replace />} />
        <Route path="/organizer/login" element={<Navigate to="/login" state={{ role: 'organizer' }} replace />} />

        {/* Dashboard Routes */}
        <Route 
          path="/volunteer/dashboard" 
          element={user && user.role === 'volunteer' ? <VolunteerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" state={{ role: 'volunteer' }} replace />} 
        />
        <Route 
          path="/organizer/dashboard" 
          element={user && user.role === 'organizer' ? <OrganizerDashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" state={{ role: 'organizer' }} replace />} 
        />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
