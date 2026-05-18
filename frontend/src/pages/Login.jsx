import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { volunteerLogin, organizerLogin } from '../utils/api';

const Login = ({ setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Capture initial role selection passed from Landing page (default fallback is 'volunteer')
  const initialRole = location.state?.role || 'volunteer';
  const [role, setRole] = useState(initialRole);
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    setLoading(true);

    try {
      let response;
      if (role === 'volunteer') {
        response = await volunteerLogin(formData);
      } else {
        response = await organizerLogin(formData);
      }

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      navigate(`/${role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
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
            {isVolunteer ? 'Volunteer Account Login' : 'Organizer Portal Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-600 font-medium">
            {isVolunteer 
              ? 'Welcome back! Ready to contribute to your college fest? 👋' 
              : 'Secure access panel for coordinative organizers 👑'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 transition-all duration-300">
          {/* Elegant Role Switcher Toggle */}
          <div className="flex bg-gray-100 p-1.5 rounded-xl mb-6 relative">
            <button
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
              🙋‍♂️ Volunteer Mode
            </button>
            <button
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
              📋 Organizer Mode
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                {isVolunteer ? 'College Email Address' : 'Organizer Email Address'}
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

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 transition duration-200 text-sm placeholder-gray-400 font-medium ${
                  isVolunteer ? 'focus:ring-indigo-500 focus:border-transparent' : 'focus:ring-purple-500 focus:border-transparent'
                }`}
                placeholder="••••••••"
                value={formData.password}
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
              {loading ? 'Authenticating credentials...' : 'Enter Dashboard'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-500 font-medium">
              Don't have an account yet?{' '}
              <Link 
                to="/signup" 
                state={{ role }} 
                className={`font-bold transition-colors ${isVolunteer ? 'text-indigo-600 hover:text-indigo-500' : 'text-purple-600 hover:text-purple-500'}`}
              >
                Sign up as {role} here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
