import React, { useState, useEffect } from 'react';
import { getTasks, concludeActivityAndIssueCertificates } from '../utils/api';

const ActivityClosureModal = ({ isOpen, onClose, activity, approvedVolunteers, onConcludeSuccess }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTasks();
    }
  }, [isOpen, activity]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await getTasks();
      const allTasks = res.data || [];
      // Filter tasks associated with this activity
      const activityTasks = allTasks.filter(t => t.activityId === activity.id);
      setTasks(activityTasks);

      // Pre-check smart defaults: completed 100% of their assigned tasks
      const initialSelection = {};
      approvedVolunteers.forEach(vol => {
        const volTasks = activityTasks.filter(t => t.assignedVolunteerId === vol.id);
        const completedTasks = volTasks.filter(t => t.completed);
        
        // Smart Default: pre-check if 100% of their assigned tasks are completed
        const isEligible = volTasks.length === 0 || (completedTasks.length === volTasks.length);
        initialSelection[vol.id] = isEligible;
      });
      setSelectedVolunteers(initialSelection);
    } catch (err) {
      console.error('Error fetching tasks for closure evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVolunteer = (volId) => {
    setSelectedVolunteers(prev => ({
      ...prev,
      [volId]: !prev[volId]
    }));
  };

  const handleSelectAll = (check) => {
    const updated = {};
    approvedVolunteers.forEach(v => {
      updated[v.id] = check;
    });
    setSelectedVolunteers(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const certifiedIds = Object.keys(selectedVolunteers).filter(id => selectedVolunteers[id]);
    
    if (certifiedIds.length === 0) {
      if (!window.confirm("You have selected zero volunteers for certification. Concluding this activity will end it, but no certificates will be issued. Proceed?")) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to conclude "${activity.title}" and issue certificates to the ${certifiedIds.length} selected volunteers? This action is permanent.`)) {
        return;
      }
    }

    setSubmitting(true);
    try {
      await concludeActivityAndIssueCertificates(activity.id, certifiedIds);
      alert('Activity successfully concluded and digital certificates issued!');
      if (onConcludeSuccess) {
        onConcludeSuccess();
      }
      onClose();
    } catch (err) {
      console.error('Error concluding activity:', err);
      alert(err.response?.data?.message || 'Failed to conclude activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-scale-up">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-550 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              🎓 Conclude & Issue Certifications
            </h3>
            <p className="text-xs text-white/80 mt-1 truncate max-w-md">
              Conclude "{activity.title}" and award credentials to your dedicated team!
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="bg-amber-55/70 border border-amber-200/50 rounded-xl p-4 text-xs text-amber-800 leading-relaxed font-medium">
              ⚠️ <strong>Warning:</strong> Concluding an activity shifts its status to <strong>"ended"</strong>. This stops all volunteer recruiting and freezes active sign-ups. Deserving team members selected below will receive a unique verified college credential card on their dashboards instantly.
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <p className="text-xs text-gray-400 mt-3 font-semibold animate-pulse">Calculating volunteer task completions...</p>
              </div>
            ) : approvedVolunteers.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                <span className="text-3xl block mb-2">👥</span>
                <p className="text-sm font-bold text-gray-500 mb-1">No Approved Volunteers</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Only approved team members can be certified. There are no approved volunteers for this activity yet.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-700 text-sm">
                    Select Certified Volunteers ({approvedVolunteers.length})
                  </h4>
                  <div className="flex gap-2 text-xs">
                    <button 
                      type="button"
                      onClick={() => handleSelectAll(true)}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Check All
                    </button>
                    <span className="text-gray-300">|</span>
                    <button 
                      type="button"
                      onClick={() => handleSelectAll(false)}
                      className="text-gray-500 font-semibold hover:underline"
                    >
                      Uncheck All
                    </button>
                  </div>
                </div>

                {/* Volunteer Grid List */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {approvedVolunteers.map(vol => {
                    const volTasks = tasks.filter(t => t.assignedVolunteerId === vol.id);
                    const completedTasks = volTasks.filter(t => t.completed);
                    
                    const is100Percent = volTasks.length === 0 || (completedTasks.length === volTasks.length);
                    const isChecked = !!selectedVolunteers[vol.id];

                    return (
                      <div 
                        key={vol.id} 
                        onClick={() => handleToggleVolunteer(vol.id)}
                        className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer transition ${
                          isChecked 
                            ? 'bg-indigo-50/50 border-indigo-200/60 shadow-sm' 
                            : 'border-gray-100 hover:bg-gray-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Handled by div click
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                          />
                          <div>
                            <p className="text-sm font-bold text-gray-800">{vol.email}</p>
                            {vol.rollNo && (
                              <p className="text-[10px] text-gray-400">Roll No: {vol.rollNo}</p>
                            )}
                          </div>
                        </div>

                        {/* Completion Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold border px-2.5 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${
                            is100Percent 
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                              : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>
                            {is100Percent ? '✅' : '⏳'} {completedTasks.length}/{volTasks.length} Tasks
                          </span>
                          {is100Percent && volTasks.length > 0 && (
                            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded shadow-sm">
                              Star ⭐
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || approvedVolunteers.length === 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Concluding Activity...
                </>
              ) : (
                <>🎓 Conclude & Issue Certificates</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityClosureModal;
