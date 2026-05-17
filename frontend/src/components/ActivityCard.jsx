import { useState } from 'react';
import { getActivityVolunteers, setActivityLeader } from '../utils/api';

const ActivityCard = ({ activity, onJoin, isVolunteer, showJoinButton = false, onLeaderAssigned }) => {
  const [expanded, setExpanded] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [leaderEmail, setLeaderEmail] = useState(activity.leaderEmail || null);
  const [loadingVols, setLoadingVols] = useState(false);
  const [hoveredEmail, setHoveredEmail] = useState(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleToggle = async () => {
    if (!expanded) {
      setLoadingVols(true);
      try {
        const res = await getActivityVolunteers(activity.id);
        setVolunteers(res.data.volunteers);
        setLeaderEmail(res.data.leaderEmail);
      } catch (err) {
        console.error('Failed to load volunteers', err);
      } finally {
        setLoadingVols(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleAssignLeader = async (email) => {
    if (!window.confirm(`Assign ${email} as the leader for "${activity.title}"?`)) return;
    try {
      await setActivityLeader(activity.id, email);
      setLeaderEmail(email);
      if (onLeaderAssigned) onLeaderAssigned();
      alert(`${email} has been assigned as leader!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign leader');
    }
  };

  return (
    <div className="card p-0 cursor-pointer group">
      {/* Main card body — clickable */}
      <div className="p-6" onClick={handleToggle}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            activity.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
          }`}>
            {activity.status}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4">{activity.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-700">
            <span className="font-semibold mr-2">📅 Date:</span>
            <span>{formatDate(activity.date)}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="font-semibold mr-2">📍 Location:</span>
            <span>{activity.location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <span className="font-semibold mr-2">👥 Volunteers:</span>
            <span>{activity.volunteers.length} / {activity.volunteersNeeded || 'Unlimited'}</span>
          </div>
          {(leaderEmail || activity.leaderEmail) && (
            <div className="flex items-center text-gray-700">
              <span className="font-semibold mr-2">👑 Leader:</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {leaderEmail || activity.leaderEmail}
              </span>
            </div>
          )}
        </div>

        {/* Expand hint */}
        <div className="flex items-center justify-center text-xs text-gray-400 group-hover:text-primary-500 transition-colors">
          <span>{expanded ? '▲ Click to collapse' : '▼ Click to see volunteers'}</span>
        </div>
      </div>

      {/* Join button — outside the toggle area so clicks don't conflict */}
      {showJoinButton && isVolunteer && (
        <div className="px-6 pb-6" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onJoin(activity.id)}
            className="w-full btn-primary"
          >
            Join Activity
          </button>
        </div>
      )}

      {/* Expanded volunteer list */}
      {expanded && (
        <div
          className="border-t border-gray-100 bg-gray-50/60 px-6 py-5 rounded-b-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
            Volunteer List
          </h4>

          {loadingVols ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading volunteers...</p>
          ) : volunteers.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No volunteers have joined yet.</p>
          ) : (
            <ul className="space-y-2">
              {volunteers.map((vol) => (
                <li
                  key={vol.id}
                  className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
                  onMouseEnter={() => setHoveredEmail(vol.email)}
                  onMouseLeave={() => setHoveredEmail(null)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar circle */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {vol.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{vol.email}</p>
                      {vol.rollNo && (
                        <p className="text-xs text-gray-400">Roll: {vol.rollNo}</p>
                      )}
                    </div>
                    {leaderEmail === vol.email && (
                      <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold shrink-0">
                        👑 Leader
                      </span>
                    )}
                  </div>

                  {/* Assign as Leader button — organizer only, on hover */}
                  {!isVolunteer && leaderEmail !== vol.email && hoveredEmail === vol.email && (
                    <button
                      onClick={() => handleAssignLeader(vol.email)}
                      className="ml-3 shrink-0 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow hover:from-amber-400 hover:to-orange-400 transition-all duration-200 transform hover:scale-105"
                    >
                      Assign as Leader
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ActivityCard;
