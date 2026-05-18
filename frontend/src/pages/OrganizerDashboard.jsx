import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ActivityCard from '../components/ActivityCard';
import VolunteerActivityTracker from '../components/VolunteerActivityTracker';
import { getMyActivities, createActivity, deleteActivity } from '../utils/api';

const OrganizerDashboard = ({ user, onLogout }) => {
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeSection, setActiveSection] = useState('activities');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    volunteersNeeded: '',
    leaderEmail: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await getMyActivities();
      setMyActivities(res.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createActivity({
        ...formData,
        volunteersNeeded: parseInt(formData.volunteersNeeded) || 0
      });
      alert('Activity created successfully!');
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        volunteersNeeded: '',
        leaderEmail: ''
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create activity');
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (!window.confirm('Are you sure you want to delete this activity? This will cascade delete all linked tasks, applications, and team chat histories! This action cannot be undone.')) {
      return;
    }

    // Optimistic UI updates
    const previousActivities = [...myActivities];

    setMyActivities(prev => prev.filter(act => act.id !== activityId));

    try {
      await deleteActivity(activityId);
      alert('Activity and linked tasks deleted successfully.');
      fetchData(); // Sync exact data state
    } catch (error) {
      console.error('Failed to delete activity:', error);
      alert(error.response?.data?.message || 'Failed to delete activity. Rolling back.');
      // Rollback
      setMyActivities(previousActivities);
    }
  };

  const totalVolunteers = myActivities.reduce(
    (sum, activity) => sum + activity.volunteers.length,
    0
  );

  const totalTasksCount = myActivities.reduce(
    (sum, activity) => sum + (activity.tasks?.length || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-purple-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Organizer Dashboard 📋
            </h1>
            <p className="text-gray-600">
              Manage your events, tasks, and track volunteer participation
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
            >
              {showCreateForm ? '✕ Cancel' : '+ Create Activity'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="🎯"
            title="Events Created"
            value={myActivities.length}
            color="purple"
          />
          <StatsCard
            icon="👥"
            title="Total Volunteers"
            value={totalVolunteers}
            color="green"
          />
          <StatsCard
            icon="✨"
            title="Active Events"
            value={myActivities.filter(a => a.status === 'upcoming').length}
            color="orange"
          />
          <StatsCard
            icon="📋"
            title="Total Tasks"
            value={totalTasksCount}
            color="primary"
          />
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold text-purple-600 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Create Activity Form */}
        {showCreateForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Activity</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Activity Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    placeholder="e.g., Registration Desk Management"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    required
                    className="input-field"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows="4"
                  className="input-field"
                  placeholder="Describe the activity and responsibilities..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    className="input-field"
                    placeholder="e.g., Main Auditorium"
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volunteers Needed
                  </label>
                  <input
                    type="number"
                    name="volunteersNeeded"
                    min="0"
                    className="input-field"
                    placeholder="e.g., 10"
                    value={formData.volunteersNeeded}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leader Email (Optional)
                </label>
                <input
                  type="email"
                  name="leaderEmail"
                  className="input-field"
                  placeholder="e.g., leader@student.com"
                  value={formData.leaderEmail}
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                Create Activity
              </button>
            </form>
          </div>
        )}

        {/* Section Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection('activities')}
                className={`${
                  activeSection === 'activities'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
              >
                Activities ({myActivities.length})
              </button>
              <button
                onClick={() => setActiveSection('workforce')}
                className={`${
                  activeSection === 'workforce'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
              >
                Workforce Tracker 👥
              </button>
            </nav>
          </div>
        </div>

        {/* Activities Section */}
        {activeSection === 'activities' && (
          <div>
            {myActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myActivities.map(activity => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    isVolunteer={false}
                    onDeleteActivity={handleDeleteActivity}
                    onConcludeSuccess={fetchData}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-500 text-lg mb-4">You haven't created any activities yet</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Create Your First Activity
                </button>
              </div>
            )}
          </div>
        )}

        {/* Workforce Tracker Section */}
        {activeSection === 'workforce' && (
          <VolunteerActivityTracker />
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
