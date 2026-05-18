import React, { useState, useEffect } from 'react';
import { getVolunteerOverview } from '../utils/api';

const VolunteerActivityTracker = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getVolunteerOverview();
      setVolunteers(res.data);
    } catch (err) {
      console.error('Failed to load volunteer workforce details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Filter volunteers based on search terms
  const filteredVolunteers = volunteers.filter(vol => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      vol.name.toLowerCase().includes(searchLower) ||
      vol.email.toLowerCase().includes(searchLower) ||
      vol.rollNumber.toLowerCase().includes(searchLower) ||
      (vol.activeActivities || []).some(act => act.toLowerCase().includes(searchLower)) ||
      (vol.badges || []).some(badge => badge.toLowerCase().includes(searchLower));

    const matchesActive = filterActiveOnly ? (vol.activeActivities || []).length > 0 : true;

    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg className="animate-spin h-10 w-10 text-primary-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500 font-medium">Aggregating workforce analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
            👥 Workforce Activity Tracker
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Real-time visual tracker mapping volunteer assignments, task completion checklists, and credentials.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="self-start md:self-auto px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl transition font-semibold text-xs flex items-center gap-1.5 shadow-sm"
        >
          🔄 Refresh Data
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6 bg-gray-55 p-4 rounded-xl border border-gray-100">
        <div className="w-full md:max-w-md relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            🔍
          </span>
          <input
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-sm"
            placeholder="Search by name, roll number, activity, or badge..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-auto flex items-center gap-2">
          <input
            type="checkbox"
            id="activeFilter"
            checked={filterActiveOnly}
            onChange={(e) => setFilterActiveOnly(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
          />
          <label htmlFor="activeFilter" className="text-sm font-semibold text-gray-600 cursor-pointer select-none">
            Show Active Only (Assigned to ≥ 1 Activity)
          </label>
        </div>
      </div>

      {/* Roster Table */}
      {filteredVolunteers.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
          <p className="text-gray-400 text-lg italic">No volunteers match the current search filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
            <thead className="bg-gray-50/70">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-xs">Volunteer</th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-xs">Roll Number</th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-xs">Assigned Activities</th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-xs">Task Checklist Progress</th>
                <th className="px-6 py-4 font-bold text-gray-700 uppercase tracking-wider text-xs">Earned Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredVolunteers.map((vol) => {
                const pct = getProgressPercentage(vol.completedTasksCount, vol.totalAssignedTasksCount);
                
                return (
                  <tr key={vol.volunteerId} className="hover:bg-gray-50/50 transition duration-150">
                    {/* Volunteer Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
                          {vol.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{vol.name}</p>
                          <p className="text-xs text-gray-400">{vol.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Roll Number Column */}
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-600">
                      {vol.rollNumber || <span className="text-gray-300 font-normal italic">N/A</span>}
                    </td>

                    {/* Assigned Activities Column */}
                    <td className="px-6 py-4">
                      {vol.activeActivities.length === 0 ? (
                        <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-md text-[10px] font-bold">
                          Unassigned
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {vol.activeActivities.map((title, i) => (
                            <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 shadow-sm">
                              {title}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Task Progress Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vol.totalAssignedTasksCount === 0 ? (
                        <span className="text-xs text-gray-400 italic">No tasks assigned.</span>
                      ) : (
                        <div className="w-48">
                          <div className="flex justify-between items-center text-xs font-bold text-gray-600 mb-1.5">
                            <span>{pct}% Completed</span>
                            <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                              {vol.completedTasksCount}/{vol.totalAssignedTasksCount}
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 shadow-sm ${
                                pct === 100 
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                                  : pct >= 50 
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500' 
                                    : 'bg-gradient-to-r from-red-400 to-rose-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Badges Column */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {vol.badges.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No badges earned.</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {vol.badges.map((badge, i) => (
                            <span key={i} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wide">
                              🏆 {badge}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VolunteerActivityTracker;
