import { useState, useEffect } from 'react';
import { getActivityVolunteers, setActivityLeader, createTask } from '../utils/api';
import ApplicationManager from './ApplicationManager';
import ApplicationTracker from './ApplicationTracker';
import TodoList from './TodoList';
import SkillFilter from './SkillFilter';
import Chatroom from './Chatroom';
import ActivityClosureModal from './ActivityClosureModal';

const ActivityCard = ({ activity, onJoin, isVolunteer, showJoinButton = false, onLeaderAssigned, onDeleteActivity, onConcludeSuccess, onBadgeEarned }) => {
  const [expanded, setExpanded] = useState(false);
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [leaderEmail, setLeaderEmail] = useState(activity.leaderEmail || null);
  const [loadingVols, setLoadingVols] = useState(false);
  const [hoveredEmail, setHoveredEmail] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);

  const [activityTasks, setActivityTasks] = useState(activity.tasks || []);
  useEffect(() => {
    setActivityTasks(activity.tasks || []);
  }, [activity.tasks]);

  const [showInlineTaskForm, setShowInlineTaskForm] = useState(false);
  const [inlineTaskForm, setInlineTaskForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assignedTo: ''
  });

  const handleInlineTaskSubmit = async (e) => {
    e.preventDefault();
    if (!inlineTaskForm.title || !inlineTaskForm.description) {
      alert('Task title and description are required.');
      return;
    }
    try {
      const res = await createTask({
        ...inlineTaskForm,
        activityId: activity.id,
        assignedTo: inlineTaskForm.assignedTo || null
      });
      alert('Task created successfully!');
      setActivityTasks(prev => [...prev, res.data]);
      setInlineTaskForm({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        assignedTo: ''
      });
      setShowInlineTaskForm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task.');
    }
  };

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');

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
        setFilteredVolunteers(res.data.volunteers);
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
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {loggedInUser.role === 'organizer' && onDeleteActivity && (
              <button
                onClick={() => onDeleteActivity(activity.id)}
                className="p-1 px-2 border border-red-200 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-all text-sm font-semibold flex items-center gap-1 shadow-sm"
                title="Delete Activity"
              >
                🗑️ Delete
              </button>
            )}
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              activity.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {activity.status}
            </span>
          </div>
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
          {loadingVols ? (
            <p className="text-sm text-gray-500 animate-pulse">Loading volunteers...</p>
          ) : isVolunteer ? (
            <div className="space-y-6">
              <ApplicationTracker
                activities={[{ ...activity, userStatus: activity.userStatus || 'pending' }]}
                onOpenChat={() => setShowChat(true)}
              />
              
              {activity.userStatus === 'approved' && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <TodoList
                    tasks={activityTasks?.filter(t => !t.assignedTo || t.assignedTo === loggedInUser.email) || []}
                    activityId={activity.id}
                    setTasks={setActivityTasks}
                    onBadgeEarned={(newBadges) => {
                      if (onBadgeEarned) onBadgeEarned(newBadges);
                    }}
                  />
                </div>
              )}

              {activity.userStatus === 'approved' && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Approved Team Members
                  </h4>
                  {volunteers.filter(v => v.status === 'approved').length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No other volunteers have been approved yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {volunteers.filter(v => v.status === 'approved').map((vol) => (
                        <li
                          key={vol.id}
                          className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 min-w-0">
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Volunteer Application & Recruiting Pipeline
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowChat(true)}
                    className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow transition"
                  >
                    💬 Open Team Chatroom
                  </button>
                  {activity.status !== 'ended' && (
                    <button
                      onClick={() => setShowClosureModal(true)}
                      className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1"
                    >
                      🎓 Conclude & Certify
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Search / Skill-based dynamic filtering */}
              <SkillFilter
                volunteers={volunteers}
                onFilterChange={setFilteredVolunteers}
              />

              {/* Dynamic recruiter pipeline manager */}
              <ApplicationManager
                activityId={activity.id}
                volunteers={filteredVolunteers}
                setVolunteers={(updatedVols) => {
                  setVolunteers(updatedVols);
                  setFilteredVolunteers(updatedVols);
                }}
                leaderEmail={leaderEmail}
                handleAssignLeader={handleAssignLeader}
              />

              {/* Contextual Activity Task Management for Organizer view */}
              <div className="mt-6 border-t border-gray-100 pt-6 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    📋 Activity Tasks & Checklist
                  </h4>
                  {activity.status !== 'ended' && (
                    <button
                      onClick={() => setShowInlineTaskForm(!showInlineTaskForm)}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition"
                    >
                      {showInlineTaskForm ? '✕ Close Form' : '+ Add New Task'}
                    </button>
                  )}
                </div>

                {showInlineTaskForm && (
                  <form onSubmit={handleInlineTaskSubmit} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-4 transition-all duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Task Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Set up stage audio"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          value={inlineTaskForm.title}
                          onChange={(e) => setInlineTaskForm({ ...inlineTaskForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Deadline (Optional)</label>
                        <input
                          type="datetime-local"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          value={inlineTaskForm.deadline}
                          onChange={(e) => setInlineTaskForm({ ...inlineTaskForm, deadline: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1.5">Description *</label>
                      <textarea
                        required
                        rows="2"
                        placeholder="Detail the instructions for this task..."
                        className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        value={inlineTaskForm.description}
                        onChange={(e) => setInlineTaskForm({ ...inlineTaskForm, description: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Priority</label>
                        <select
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          value={inlineTaskForm.priority}
                          onChange={(e) => setInlineTaskForm({ ...inlineTaskForm, priority: e.target.value })}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1.5">Assign to Volunteer (Email - optional)</label>
                        <input
                          type="email"
                          placeholder="e.g. volunteer@student.com"
                          className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-800 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          value={inlineTaskForm.assignedTo}
                          onChange={(e) => setInlineTaskForm({ ...inlineTaskForm, assignedTo: e.target.value })}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition"
                    >
                      🚀 Add Task to {activity.title}
                    </button>
                  </form>
                )}

                <TodoList
                  tasks={activityTasks}
                  setTasks={setActivityTasks}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Real-time Team Chat Room Modal */}
      {showChat && (
        <Chatroom
          activity={activity}
          user={loggedInUser}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Conclude Activity Modal */}
      {showClosureModal && (
        <ActivityClosureModal
          isOpen={showClosureModal}
          onClose={() => setShowClosureModal(false)}
          activity={activity}
          approvedVolunteers={volunteers.filter(v => v.status === 'approved')}
          onConcludeSuccess={() => {
            activity.status = 'ended';
            if (onConcludeSuccess) {
              onConcludeSuccess();
            } else if (onLeaderAssigned) {
              onLeaderAssigned();
            }
          }}
        />
      )}
    </div>
  );
};

export default ActivityCard;
