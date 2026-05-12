import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-extrabold text-gray-900 mb-6 animate-fade-in">
              🎉 College Fest
              <span className="block text-primary-600 mt-2">Volunteer Management</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Join the most exciting college fest of the year! Whether you're a volunteer looking to contribute 
              or an organizer planning amazing events, we've got you covered.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="w-full sm:w-auto">
                <Link to="/volunteer/signup" className="block w-full sm:w-auto">
                  <button className="btn-primary w-full sm:w-auto text-lg px-8 py-4">
                    Join as Volunteer 🙋‍♂️
                  </button>
                </Link>
              </div>
              <div className="w-full sm:w-auto">
                <Link to="/organizer/signup" className="block w-full sm:w-auto">
                  <button className="btn-secondary w-full sm:w-auto text-lg px-8 py-4">
                    Register as Organizer 📋
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
          Why Join Us?
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Connect & Collaborate</h3>
            <p className="text-gray-600">
              Meet like-minded students and work together to create memorable experiences
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Track Your Impact</h3>
            <p className="text-gray-600">
              Monitor your contributions and see the difference you're making in real-time
            </p>
          </div>
          
          <div className="card text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">Organized Events</h3>
            <p className="text-gray-600">
              Seamlessly manage and participate in various fest activities and events
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Already have an account? Sign in now!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/volunteer/login">
              <button className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Volunteer Login
              </button>
            </Link>
            <Link to="/organizer/login">
              <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Organizer Login
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2024 College Fest Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
