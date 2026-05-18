import React from 'react';

const ApplicationTracker = ({ activities, onOpenChat }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
            Approved 🎉
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">
            Rejected ❌
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-200 animate-pulse">
            Pending Review ⏳
          </span>
        );
    }
  };

  const safeActivities = activities || [];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        📈 Live Application Tracker
      </h2>

      {safeActivities.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="text-gray-500 text-base">You haven't applied for any activities yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {safeActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-col md:flex-row md:items-center justify-between border border-gray-100 rounded-xl p-4 bg-gray-50/50 hover:bg-gray-50 transition duration-200"
            >
              <div className="min-w-0 flex-1 pr-4">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <h3 className="text-lg font-bold text-gray-800 truncate">{activity.title}</h3>
                  {getStatusBadge(activity.userStatus)}
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">{activity.description}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                  <span>📍 {activity.location}</span>
                  <span>📅 {new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 shrink-0 flex items-center gap-2">
                {activity.userStatus === 'approved' && (
                  <button
                    onClick={() => onOpenChat(activity)}
                    className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-bold rounded-lg shadow-md transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    💬 Team Chatroom
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApplicationTracker;
