import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ActivityCard from '../components/ActivityCard';
import SkillBuilder from '../components/SkillBuilder';
import ApplicationTracker from '../components/ApplicationTracker';
import BadgeShowcase from '../components/BadgeShowcase';
import TodoList from '../components/TodoList';
import Chatroom from '../components/Chatroom';
import OpportunityBoard from '../components/OpportunityBoard';
import CertificateVault from '../components/CertificateVault';
import { getAllActivities, getMyActivities, joinActivity, getAISuggestion, getVolunteerProfile } from '../utils/api';

const VolunteerDashboard = ({ user, onLogout }) => {
  const [localUser, setLocalUser] = useState(user);
  const [certifications, setCertifications] = useState(user?.certifications || []);
  const [allActivities, setAllActivities] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [activeChatRoom, setActiveChatRoom] = useState(null);

  const handleProfileUpdate = (updatedUser) => {
    setLocalUser(updatedUser);
    // Keep localStorage in sync so refresh doesn't wipe updates
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

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
      const [allRes, myRes, profileRes] = await Promise.all([
        getAllActivities(),
        getMyActivities(),
        getVolunteerProfile().catch(() => ({ data: { user: localUser } }))
      ]);
      setAllActivities(allRes.data);
      setMyActivities(myRes.data);
      
      if (profileRes && profileRes.data && profileRes.data.user) {
        const updatedUser = profileRes.data.user;
        setLocalUser(updatedUser);
        setCertifications(updatedUser.certifications || []);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
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

  const availableActivities = (allActivities || []).filter(
    activity => !(myActivities || []).find(my => my.id === activity.id)
  );

  // Aggregated total of all tasks across volunteer's approved activities
  const totalTasksCount = (myActivities || [])
    .filter(activity => activity.userStatus === 'approved')
    .reduce((acc, curr) => acc + (curr.tasks?.length || 0), 0);

  if (loading) return <div className="text-center p-10">Loading your FestOps Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={localUser} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {(localUser?.email || '').split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600 font-medium">
              Fest Coordination Central • Stay connected, complete tasks, and earn special status badges!
            </p>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchData();
            }}
            className="px-4 py-2 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-200 rounded-xl font-bold text-xs shadow-sm transition flex items-center gap-1.5 active:scale-95 shrink-0"
          >
            🔄 Refresh Dashboard
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon="🎯"
            title="Activities Applied"
            value={myActivities?.length || 0}
            color="primary"
          />
          <StatsCard
            icon="✨"
            title="Available Opportunities"
            value={availableActivities?.length || 0}
            color="green"
          />
          <StatsCard
            icon="🏆"
            title="Earned Badges"
            value={(localUser?.badges || []).length}
            color="purple"
          />
          <StatsCard
            icon="📋"
            title="My Checklists"
            value={totalTasksCount}
            color="orange"
          />
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column: Action Checklists & Status Tracker */}
          <div className="lg:col-span-2 space-y-8">
            {/* AI Assistant Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    🤖 AI Fest Opportunity Guide
                  </h2>
                  <p className="text-white/80 mt-1">
                    Tell us your skills and interests — our custom Gemini AI will suggest the best fit roles!
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowAiPanel(!showAiPanel);
                    if (!showAiPanel) {
                      setAiInput({
                        skills: (localUser?.skills || []).join(', '),
                        interests: (localUser?.interests || []).join(', ')
                      });
                    }
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  {showAiPanel ? 'Close AI Guide' : 'Analyze Profile ✨'}
                </button>
              </div>

              {showAiPanel && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mt-4">
                  <form onSubmit={handleAISuggestion} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2">
                        Your Skills (Auto-imported from Profile Builder)
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
                        Your Interests (Auto-imported from Profile Builder)
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

            {/* Discovery Board */}
            <OpportunityBoard onApplicationSuccess={fetchData} />

            {/* My Joined Activities & Checklists */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                  📅 My Joined Activities & Contextual Checklists
                </h2>
                <p className="text-sm text-gray-500">
                  Expand any activity below to access your team chatroom, registered members list, and task checklists!
                </p>
              </div>

              {(myActivities || []).length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
                  <p className="text-gray-500 text-base">You haven't joined any activities yet. Apply using the discovery board!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {myActivities?.map(activity => (
                    <ActivityCard
                      key={activity.id}
                      activity={activity}
                      isVolunteer={true}
                      onLeaderAssigned={fetchData}
                      onBadgeEarned={(newBadges) => handleProfileUpdate({ ...localUser, badges: newBadges })}
                    />
                  )) || []}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Skill Builder, Badges Showcase */}
          <div className="space-y-8">
            {/* Skill Profile Builder */}
            <SkillBuilder
              user={localUser}
              onProfileUpdate={handleProfileUpdate}
            />

            {/* Badge System */}
            <BadgeShowcase
              badges={localUser.badges || []}
            />

            {/* Verified Credentials Certificate Vault */}
            <CertificateVault
              certifications={certifications}
            />
          </div>
        </div>

      </div>

      {/* Real-time Team Chat Room */}
      {activeChatRoom && (
        <Chatroom
          activity={activeChatRoom}
          user={localUser}
          onClose={() => setActiveChatRoom(null)}
        />
      )}
    </div>
  );
};

export default VolunteerDashboard;
