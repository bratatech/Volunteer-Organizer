import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ActivityCard from '../components/ActivityCard';
import { getAllActivities, getMyActivities, joinActivity, getAISuggestion, getMyTasks } from '../utils/api';

const VolunteerDashboard = ({ user, onLogout }) => {
  const [allActivities, setAllActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');

  // AI Assistant state
  const [aiInput, setAiInput] = useState({ skills: '', interests: '' });
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allRes, myRes, tasksRes] = await Promise.all([
        getAllActivities(),
        getMyActivities(),
        getMyTasks().catch(() => ({ data: [] }))
      ]);
      setAllActivities(allRes.data);
      setMyActivities(myRes.data);
      setMyTasks(tasksRes.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinActivity = async (activityId) => {
    try {
      await joinActivity(activityId);
      alert('Successfully joined the activity!');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to join activity');
    }
  };

  const handleAISuggestion = async (e) => {
    e.preventDefault();
    if (!aiInput.skills.trim() || !aiInput.interests.trim()) {
      alert('Please enter both your skills and interests');
      return;
    }

    setAiLoading(true);
    setAiSuggestion('');
    try {
      const response = await getAISuggestion({
        skills: aiInput.skills,
        interests: aiInput.interests
      });
      setAiSuggestion(response.data.suggestion);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to get AI suggestion');
    } finally {
      setAiLoading(false);
    }
  };

  const availableActivities = allActivities.filter(
    activity => !myActivities.find(my => my.id === activity.id)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-semibold text-primary-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, Volunteer! 👋
          </h1>
          <p className="text-gray-600">
            Here's your activity overview and available opportunities
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="🎯"
            title="Activities Joined"
            value={myActivities.length}
            color="primary"
          />
          <StatsCard
            icon="✨"
            title="Available Activities"
            value={availableActivities.length}
            color="green"
          />
          <StatsCard
            icon="📊"
            title="Total Events"
            value={allActivities.length}
            color="purple"
          />
          <StatsCard
            icon="📋"
            title="Assigned Tasks"
            value={myTasks.length}
            color="orange"
          />
        </div>

        {/* AI Assistant Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                🤖 AI Area Suggestion
              </h2>
              <p className="text-white/80 mt-1">
                Tell us your skills and interests — our AI will suggest the best volunteer area for you!
              </p>
            </div>
            <button
              onClick={() => setShowAiPanel(!showAiPanel)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {showAiPanel ? 'Close' : 'Get Suggestion'}
            </button>
          </div>

          {showAiPanel && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-4">
              <form onSubmit={handleAISuggestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Your Skills
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="e.g., Photography, Public Speaking, First Aid, Graphic Design..."
                    value={aiInput.skills}
                    onChange={(e) => setAiInput({ ...aiInput, skills: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/90 mb-2">
                    Your Interests
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-white/30 rounded-lg bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
                    placeholder="e.g., Event Management, Social Work, Teaching, Sports..."
                    value={aiInput.interests}
                    onChange={(e) => setAiInput({ ...aiInput, interests: e.target.value })}
                  />
                </div>
                <button
                  type="submit"
                  disabled={aiLoading}
                  className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {aiLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Analyzing your profile...
                    </span>
                  ) : (
                    '✨ Get AI Suggestion'
                  )}
                </button>
              </form>

              {aiSuggestion && (
                <div className="mt-6 bg-white rounded-xl p-6 text-gray-800 shadow-lg">
                  <h3 className="text-lg font-bold text-indigo-700 mb-3 flex items-center gap-2">
                    🎯 AI Recommendation
                  </h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {aiSuggestion}
                  </div>
                </div>
              )}
            </div>
          )}
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
              <p className="text-sm text-gray-600">Roll Number</p>
              <p className="text-lg font-semibold text-gray-800">{user.rollNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone Number</p>
              <p className="text-lg font-semibold text-gray-800">{user.phoneNo}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Role</p>
              <p className="text-lg font-semibold text-primary-600 capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* My Assigned Tasks */}
        {myTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 My Assigned Tasks</h2>
            <div className="space-y-3">
              {myTasks.map(task => (
                <div key={task.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    {task.deadline && (
                      <p className="text-xs text-gray-500 mt-1">
                        Deadline: {new Date(task.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('available')}
                className={`${
                  activeTab === 'available'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
              >
                Available Activities ({availableActivities.length})
              </button>
              <button
                onClick={() => setActiveTab('joined')}
                className={`${
                  activeTab === 'joined'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
              >
                My Activities ({myActivities.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === 'available' ? (
            availableActivities.length > 0 ? (
              availableActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onJoin={handleJoinActivity}
                  isVolunteer={true}
                  showJoinButton={true}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">No available activities at the moment</p>
              </div>
            )
          ) : (
            myActivities.length > 0 ? (
              myActivities.map(activity => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  isVolunteer={true}
                  showJoinButton={false}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">You haven't joined any activities yet</p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="mt-4 btn-primary"
                >
                  Browse Available Activities
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
