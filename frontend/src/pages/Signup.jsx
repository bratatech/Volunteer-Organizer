import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { volunteerSignup, organizerSignup } from '../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Capture initial role selection passed from Landing page or Login page (default fallback is 'volunteer')
  const initialRole = location.state?.role || 'volunteer';
  const [role, setRole] = useState(initialRole);
  
  const [formData, setFormData] = useState({
    email: '',
    rollNo: '',
    phoneNo: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (role === 'volunteer') {
        await volunteerSignup({
          email: formData.email,
          password: formData.password,
          rollNo: formData.rollNo,
          phoneNo: formData.phoneNo
        });
      } else {
        await organizerSignup({
          email: formData.email,
          password: formData.password
        });
      }
      
      alert('Registration successful! Please login with your new account.');
      navigate('/login', { state: { role } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  const isVolunteer = role === 'volunteer';

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 bg-gradient-to-br ${
      isVolunteer 
        ? 'from-indigo-50 via-white to-purple-50' 
        : 'from-purple-50 via-white to-indigo-50'
    }`}>
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link to="/" className={`text-4xl font-extrabold transition-colors duration-300 ${
            isVolunteer ? 'text-indigo-600' : 'text-purple-600'
          }`}>
            🎉 FestOps
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {isVolunteer ? 'Volunteer Registration' : 'Organizer Recruitment'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {isVolunteer 
              ? 'Join FestOps! Stay connected, log tasks, and earn badges! 💫' 
              : 'Launch new events, manage tasks, and coordinate students! 🎓'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transition-all duration-300">
          {/* Role Switcher Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 relative">
            <button
              type="button"
              onClick={() => {
                setRole('volunteer');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-300 ${
                isVolunteer 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🙋‍♂️ Volunteer Role
            </button>
            <button
              type="button"
              onClick={() => {
                setRole('organizer');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition duration-300 ${
                !isVolunteer 
                  ? 'bg-purple-600 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              📋 Organizer Role
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                College Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium ${
                  isVolunteer ? 'focus:ring-indigo-500 focus:border-transparent' : 'focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder={isVolunteer ? 'your.email@college.edu' : 'organizer@example.com'}
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {isVolunteer && (
              <>
                <div>
                  <label htmlFor="rollNo" className="block text-sm font-semibold text-gray-700 mb-2">
                    College Roll Number *
                  </label>
                  <input
                    id="rollNo"
                    name="rollNo"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., CS2026101"
                    value={formData.rollNo}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNo" className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Contact Number *
                  </label>
                  <input
                    id="phoneNo"
                    name="phoneNo"
                    type="tel"
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., +919876543210"
                    value={formData.phoneNo}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Security Password *
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium ${
                  isVolunteer ? 'focus:ring-indigo-500 focus:border-transparent' : 'focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Security Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium ${
                  isVolunteer ? 'focus:ring-indigo-500 focus:border-transparent' : 'focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 text-white rounded-xl font-bold text-xs shadow-md transition duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                isVolunteer 
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800' 
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
              }`}
            >
              {loading ? 'Creating new account...' : 'Create My Account'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500 font-medium">
              Already have a FestOps profile?{' '}
              <Link 
                to="/login" 
                state={{ role }} 
                className={`font-bold transition-colors ${isVolunteer ? 'text-indigo-600 hover:text-indigo-500' : 'text-purple-600 hover:text-purple-500'}`}
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
