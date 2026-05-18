import React, { useState, useEffect } from 'react';

const SkillFilter = ({ volunteers, onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [rollFilter, setRollFilter] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  // Extract all unique skills across all available volunteers for select dropdown
  const uniqueSkills = Array.from(
    new Set(volunteers.flatMap((vol) => vol.skills || []))
  );

  useEffect(() => {
    let filtered = [...volunteers];

    // Filter by Email/Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) => v.email.toLowerCase().includes(term)
      );
    }

    // Filter by Roll Number
    if (rollFilter.trim()) {
      const term = rollFilter.toLowerCase();
      filtered = filtered.filter(
        (v) => v.rollNo && v.rollNo.toLowerCase().includes(term)
      );
    }

    // Filter by Skill
    if (selectedSkill) {
      filtered = filtered.filter(
        (v) => v.skills && v.skills.includes(selectedSkill)
      );
    }

    onFilterChange(filtered);
  }, [searchTerm, rollFilter, selectedSkill, volunteers]);

  const handleReset = () => {
    setSearchTerm('');
    setRollFilter('');
    setSelectedSkill('');
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider">
          🔍 Filter & Search Team
        </h4>
        {(searchTerm || rollFilter || selectedSkill) && (
          <button
            onClick={handleReset}
            className="text-xs font-bold text-red-500 hover:text-red-700 transition"
          >
            Clear Filters ×
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search by email */}
        <input
          type="text"
          placeholder="Search by email..."
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Search by Roll Number */}
        <input
          type="text"
          placeholder="Filter by roll number..."
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:outline-none"
          value={rollFilter}
          onChange={(e) => setRollFilter(e.target.value)}
        />

        {/* Filter by Skill */}
        <select
          className="px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary-500 focus:outline-none bg-white"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
        >
          <option value="">-- Filter by Skill Set --</option>
          {uniqueSkills.map((skill, index) => (
            <option key={index} value={skill}>
              {skill}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SkillFilter;
