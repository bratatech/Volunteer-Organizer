import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import ActivityCard from '../components/ActivityCard';
import { getMyActivities, createActivity, getTasks, createTask, assignTask, unassignTask, deleteTask } from '../utils/api';

const OrganizerDashboard = ({ user, onLogout }) => {
  const [myActivities, setMyActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeSection, setActiveSection] = useState('activities');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    volunteersNeeded: ''
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium',
    assignedTo: ''
  });
  const [assignEmails, setAssignEmails] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, tasksRes] = await Promise.all([
        getMyActivities(),
        getTasks().catch(() => ({ data: [] }))
      ]);
      setMyActivities(activitiesRes.data);
      setTasks(tasksRes.data);
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

  const handleTaskChange = (e) => {
    setTaskForm({
      ...taskForm,
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
        volunteersNeeded: ''
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create activity');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    try {
      await createTask({
        ...taskForm,
        assignedTo: taskForm.assignedTo || null
      });
      alert('Task created successfully!');
      setShowTaskForm(false);
      setTaskForm({
        title: '',
        description: '',
        deadline: '',
        priority: 'medium',
        assignedTo: ''
      });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleAssignTask = async (taskId) => {
    const email = assignEmails[taskId];
    if (!email || !email.trim()) {
      alert('Please enter a volunteer email address');
      return;
    }
    try {
      await assignTask(taskId, email.trim());
      alert(`Task assigned to ${email}`);
      setAssignEmails({ ...assignEmails, [taskId]: '' });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to assign task');
    }
  };

  const handleUnassignTask = async (taskId) => {
    try {
      await unassignTask(taskId);
      alert('Task unassigned');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to unassign task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      alert('Task deleted');
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const totalVolunteers = myActivities.reduce(
    (sum, activity) => sum + activity.volunteers.length,
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
              onClick={() => { setShowTaskForm(!showTaskForm); setShowCreateForm(false); }}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              {showTaskForm ? '✕ Cancel' : '+ Create Task'}
            </button>
            <button
              onClick={() => { setShowCreateForm(!showCreateForm); setShowTaskForm(false); }}
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
            value={tasks.length}
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

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                Create Activity
              </button>
            </form>
          </div>
        )}

        {/* Create Task Form */}
        {showTaskForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-2 border-indigo-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create New Task</h2>
            <form onSubmit={handleTaskSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-field"
                    placeholder="e.g., Setup Registration Desk"
                    value={taskForm.title}
                    onChange={handleTaskChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    name="deadline"
                    className="input-field"
                    value={taskForm.deadline}
                    onChange={handleTaskChange}
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
                  rows="3"
                  className="input-field"
                  placeholder="Describe the task and what needs to be done..."
                  value={taskForm.description}
                  onChange={handleTaskChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    name="priority"
                    className="input-field"
                    value={taskForm.priority}
                    onChange={handleTaskChange}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to (Volunteer Email - optional)
                  </label>
                  <input
                    type="email"
                    name="assignedTo"
                    className="input-field"
                    placeholder="e.g., john@university.edu"
                    value={taskForm.assignedTo}
                    onChange={handleTaskChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
              >
                Create Task
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
                onClick={() => setActiveSection('tasks')}
                className={`${
                  activeSection === 'tasks'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
              >
                Tasks ({tasks.length})
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

        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <div>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{task.title}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            task.status === 'assigned' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-2">{task.description}</p>
                        {task.deadline && (
                          <p className="text-sm text-gray-500">
                            Deadline: {new Date(task.deadline).toLocaleDateString('en-US', {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 p-2 transition-colors"
                        title="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>

                    {/* Assignment Section */}
                    <div className="border-t border-gray-100 pt-4 mt-3">
                      {task.assignedTo ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Assigned to:</span>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                              {task.assignedTo}
                            </span>
                          </div>
                          <button
                            onClick={() => handleUnassignTask(task.id)}
                            className="text-sm text-orange-600 hover:text-orange-800 font-medium transition-colors"
                          >
                            Unassign
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <input
                            type="email"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Enter volunteer email to assign..."
                            value={assignEmails[task.id] || ''}
                            onChange={(e) => setAssignEmails({ ...assignEmails, [task.id]: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAssignTask(task.id);
                              }
                            }}
                          />
                          <button
                            onClick={() => handleAssignTask(task.id)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-500 text-lg mb-4">No tasks created yet</p>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Create Your First Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
