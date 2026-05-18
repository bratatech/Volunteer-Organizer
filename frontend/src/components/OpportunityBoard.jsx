import React, { useState, useEffect } from 'react';
import { getAvailableOpportunities, applyForOpportunity } from '../utils/api';

const OpportunityBoard = ({ onApplicationSuccess }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Track optimistic states for specific IDs
  const [applyingActivityIds, setApplyingActivityIds] = useState({});

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getAvailableOpportunities();
      setActivities(response.data.activities || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching opportunities:', err);
      setError('Failed to load available opportunities. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const handleApplyActivity = async (activityId) => {
    // Save original state for rollback if needed
    const previousActivities = [...activities];

    // Optimistic Update: Mark as applying and show Pending Approval yellow badge immediately
    setApplyingActivityIds(prev => ({ ...prev, [activityId]: 'applying' }));

    try {
      await applyForOpportunity(activityId);
      
      // Update state: Set to success
      setApplyingActivityIds(prev => ({ ...prev, [activityId]: 'success' }));
      
      // Remove from available list after a short delay so the user sees the yellow badge
      setTimeout(() => {
        setActivities(prev => prev.filter(act => act.id !== activityId));
        if (onApplicationSuccess) {
          onApplicationSuccess(); // Notify parent to refresh applied trackers
        }
      }, 1500);
      
    } catch (err) {
      console.error('Error applying for activity:', err);
      alert(err.response?.data?.message || 'Failed to submit application. Please try again.');
      
      // Rollback optimistic state
      setActivities(previousActivities);
      setApplyingActivityIds(prev => {
        const next = { ...prev };
        delete next[activityId];
        return next;
      });
    }
  };

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-500 mt-4 text-sm font-medium animate-pulse">Scanning the campus for new activities...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            ✨ Opportunity Discovery Board
          </h2>
          <p className="text-sm text-gray-500">
            Browse active college fest recruitments and apply to join instantly!
          </p>
        </div>
        
        {/* Re-fetch Button */}
        <button 
          onClick={fetchOpportunities}
          className="text-xs font-semibold px-4 py-2 border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition flex items-center gap-1 self-start md:self-auto"
        >
          🔄 Refresh Feed
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm mb-6 font-medium">
          ⚠️ {error}
        </div>
      )}

      {/* Activities Discovery Panel */}
      <div>
        {activities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <span className="text-4xl block mb-2">🎉</span>
            <h3 className="font-bold text-gray-700 mb-1">All Caught Up!</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              You have applied to all available activities. Keep an eye out for newly added organizer recruitments!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activities.map((activity) => {
              const applyingStatus = applyingActivityIds[activity.id];
              const isApplying = applyingStatus === 'applying';
              const isSuccess = applyingStatus === 'success';

              return (
                <div 
                  key={activity.id} 
                  className="group border border-gray-100 hover:border-indigo-100 rounded-xl p-5 hover:shadow-md transition bg-gradient-to-br from-white to-gray-50 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition">
                        {activity.title}
                      </h3>
                      <span className="text-xs bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-semibold">
                        📅 {activity.date}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                      {activity.description}
                    </p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mb-4 font-medium">
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                        📍 {activity.location || 'TBD'}
                      </span>
                      <span className="flex items-center gap-1 bg-white px-2 py-1 rounded shadow-sm">
                        👥 Needs: <strong className="text-indigo-600">{activity.volunteersNeeded}</strong> volunteers
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyActivity(activity.id)}
                    disabled={isApplying || isSuccess}
                    className={`w-full py-2.5 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      isSuccess || isApplying
                        ? 'bg-amber-100 border border-amber-300 text-amber-800 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg active:scale-[0.98]'
                    }`}
                  >
                    {isSuccess || isApplying ? (
                      <>⏳ Pending Approval</>
                    ) : (
                      <>✨ Apply to Join</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OpportunityBoard;
