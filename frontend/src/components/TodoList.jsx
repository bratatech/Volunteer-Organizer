import React, { useState } from 'react';
import { toggleTaskStatus, assignTask, unassignTask, deleteTask } from '../utils/api';

const TodoList = ({ tasks, setTasks, onBadgeEarned, emptyMessage = "No tasks have been assigned to this activity yet." }) => {
  if (!tasks) return <p className="text-gray-500">No tasks found.</p>;

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOrganizer = loggedInUser.role === 'organizer';

  const [assignEmail, setAssignEmail] = useState({});

  const handleAssign = async (taskId) => {
    const email = assignEmail[taskId];
    if (!email || !email.trim()) return;
    try {
      await assignTask(taskId, email.trim());
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: email.trim(), status: 'assigned' } : t));
      setAssignEmail({ ...assignEmail, [taskId]: '' });
      alert('Task assigned successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign task.');
    }
  };

  const handleUnassign = async (taskId) => {
    try {
      await unassignTask(taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, assignedTo: null, status: 'unassigned' } : t));
      alert('Task unassigned.');
    } catch (err) {
      alert('Failed to unassign task.');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert('Failed to delete task.');
    }
  };

  const handleToggle = async (taskId) => {
    // Optimistic UI Update
    let originalTasks = [...tasks];
    
    // Optimistically toggle completion status locally in parent tasks state
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    setTasks(updatedTasks);

    try {
      const response = await toggleTaskStatus(taskId);
      // If server returned new badges, notify parent to refresh volunteer info
      if (response.data.badges && response.data.badges.length > 0 && onBadgeEarned) {
        onBadgeEarned(response.data.badges);
      }
    } catch (error) {
      // Revert if request fails
      setTasks(originalTasks);
      alert(error.response?.data?.message || 'Failed to update task status');
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'low':
      default:
        return 'bg-green-50 text-green-700 border-green-200';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📋 Volunteer To-do List & Execution
      </h2>

      {tasks.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-base">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-start gap-4 p-4 border rounded-xl transition duration-200 ${
                task.completed
                  ? 'bg-gray-50/70 border-gray-200 opacity-60'
                  : 'bg-white border-gray-100 shadow-sm hover:shadow-md'
              }`}
            >
              {/* Checkbox */}
              <div className="flex items-center h-6 shrink-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer transition duration-150"
                />
              </div>

              {/* Task Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3
                    className={`text-base font-bold text-gray-800 truncate ${
                      task.completed ? 'line-through text-gray-400 italic' : ''
                    }`}
                  >
                    {task.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 border rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityStyle(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
                
                <p
                  className={`text-sm mb-2.5 ${
                    task.completed ? 'line-through text-gray-400 italic' : 'text-gray-600'
                  }`}
                >
                  {task.description}
                </p>

                {task.deadline && (
                  <span className="inline-block text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded mr-3">
                    📅 Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}

                {isOrganizer && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 font-medium">
                          👤 Assigned: <span className="font-bold text-indigo-600">{task.assignedTo}</span>
                        </span>
                        <button
                          onClick={() => handleUnassign(task.id)}
                          className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded transition"
                        >
                          Unassign ❌
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <input
                          type="email"
                          placeholder="Assign to (email)..."
                          className="px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          value={assignEmail[task.id] || ''}
                          onChange={(e) => setAssignEmail({ ...assignEmail, [task.id]: e.target.value })}
                        />
                        <button
                          onClick={() => handleAssign(task.id)}
                          className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded transition"
                        >
                          Assign 👤
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => handleDelete(task.id)}
                      className="px-2 py-1 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 font-bold rounded transition"
                    >
                      Delete Task 🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
