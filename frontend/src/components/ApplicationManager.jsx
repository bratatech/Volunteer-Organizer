import React, { useState } from 'react';
import { handleApplicationDecision } from '../utils/api';

const ApplicationManager = ({ activityId, volunteers, setVolunteers, leaderEmail, handleAssignLeader }) => {
  const [loadingId, setLoadingId] = useState(null);

  const handleAction = async (volunteerId, action) => {
    setLoadingId(volunteerId);
    
    // Save original state for rollbacks
    const originalVolunteers = [...volunteers];
    const actionStatus = action === 'approve' ? 'approved' : 'rejected';
    
    // Optimistic UI Update: immediately update the status of the volunteer
    const updatedVolunteers = volunteers.map(vol => {
      if (vol.id === volunteerId) {
        return { ...vol, status: actionStatus };
      }
      return vol;
    });
    setVolunteers(updatedVolunteers);

    try {
      await handleApplicationDecision(activityId, volunteerId, action);
    } catch (error) {
      // Rollback if request fails
      setVolunteers(originalVolunteers);
      alert(error.response?.data?.message || 'Failed to update application status');
    } finally {
      setLoadingId(null);
    }
  };

  const pendingVolunteers = volunteers.filter(v => v.status === 'pending');
  const approvedVolunteers = volunteers.filter(v => v.status === 'approved');
  const rejectedVolunteers = volunteers.filter(v => v.status === 'rejected');

  return (
    <div className="space-y-6">
      {/* Pending Section */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider flex items-center gap-1.5">
          ⏳ Requests Pending Approval ({pendingVolunteers.length})
        </h4>

        {pendingVolunteers.length === 0 ? (
          <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-gray-100">
            No pending applications to review.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="bg-white border border-amber-100 rounded-xl p-4 shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                        {vol.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{vol.email}</p>
                        {vol.rollNo && (
                          <p className="text-xs text-gray-400">Roll: {vol.rollNo} • Tel: {vol.phoneNo}</p>
                        )}
                      </div>
                    </div>

                    {/* Skills & Interests Display */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {vol.skills && vol.skills.length > 0 ? (
                        vol.skills.map((skill, index) => (
                          <span key={index} className="px-2 py-0.5 bg-primary-50 text-primary-700 text-[10px] font-bold rounded-full border border-primary-100">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">No skills listed.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(vol.id, 'approve')}
                      disabled={loadingId === vol.id}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1"
                    >
                      ✅ Accept & Assign
                    </button>
                    <button
                      onClick={() => handleAction(vol.id, 'reject')}
                      disabled={loadingId === vol.id}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white text-xs font-bold rounded-lg shadow transition flex items-center gap-1"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Section */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
          ✅ Approved Team ({approvedVolunteers.length})
        </h4>
        {approvedVolunteers.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No approved volunteers yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {approvedVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center justify-between hover:shadow-md transition duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white text-xs font-bold">
                    {vol.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">{vol.email}</p>
                    <p className="text-[10px] text-gray-400 truncate">Roll: {vol.rollNo}</p>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0 items-center">
                  {leaderEmail === vol.email ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold border border-amber-200">
                      👑 Leader
                    </span>
                  ) : (
                    <button
                      onClick={() => handleAssignLeader(vol.email)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold border border-amber-200 transition"
                    >
                      👑 Assign Leader
                    </button>
                  )}
                  <button
                    onClick={() => handleAction(vol.id, 'reject')}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Remove from Team"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejected Section */}
      {rejectedVolunteers.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">
            🚫 Rejected Applicants ({rejectedVolunteers.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60">
            {rejectedVolunteers.map((vol) => (
              <div
                key={vol.id}
                className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                    {vol.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-500 truncate">{vol.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleAction(vol.id, 'approve')}
                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[10px] font-bold rounded"
                >
                  Reconsider
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationManager;
