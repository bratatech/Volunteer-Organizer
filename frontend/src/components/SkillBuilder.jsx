import { useState } from 'react';
import { updateVolunteerProfile } from '../utils/api';

const SkillBuilder = ({ user, onProfileUpdate }) => {
  const [skills, setSkills] = useState(user.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [interests, setInterests] = useState(user.interests || []);
  const [newInterest, setNewInterest] = useState('');
  const [instagram, setInstagram] = useState(user.socialHandles?.instagram || '');
  const [linkedin, setLinkedin] = useState(user.socialHandles?.linkedin || '');
  const [loading, setLoading] = useState(false);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setInterests(interests.filter(i => i !== interestToRemove));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await updateVolunteerProfile({
        skills,
        interests,
        socialHandles: { instagram, linkedin }
      });
      alert('Profile updated successfully!');
      if (onProfileUpdate) {
        onProfileUpdate(response.data.user);
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        🛠️ Skill & Profile Builder
      </h2>

      <div className="space-y-6">
        {/* Skills Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            My Skills
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Photography, Web Dev, Marketing"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.length === 0 ? (
              <span className="text-sm text-gray-400 italic">No skills added yet.</span>
            ) : (
              skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-semibold rounded-full border border-primary-100"
                >
                  {skill}
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-primary-400 hover:text-primary-600 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            My Interests
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Music, Technical Events, Backstage"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddInterest(e)}
            />
            <button
              onClick={handleAddInterest}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.length === 0 ? (
              <span className="text-sm text-gray-400 italic">No interests added yet.</span>
            ) : (
              interests.map((interest, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-full border border-indigo-100"
                >
                  {interest}
                  <button
                    onClick={() => handleRemoveInterest(interest)}
                    className="text-indigo-400 hover:text-indigo-600 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))
            )}
          </div>
        </div>

        {/* Social Handles */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Social Media Verification handles
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">LinkedIn Username</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <span className="bg-gray-100 text-gray-500 px-3 py-2 text-sm select-none border-r border-gray-300">in/</span>
                <input
                  type="text"
                  placeholder="username"
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>
            </div>
            <div>
              <span className="block text-xs font-medium text-gray-500 mb-1">Instagram Handle</span>
              <div className="flex rounded-lg border border-gray-300 overflow-hidden focus-within:ring-2 focus-within:ring-primary-500">
                <span className="bg-gray-100 text-gray-500 px-3 py-2 text-sm select-none border-r border-gray-300">@</span>
                <input
                  type="text"
                  placeholder="handle"
                  className="flex-1 px-3 py-2 text-sm focus:outline-none"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-4 btn-primary py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-md transition"
        >
          {loading ? 'Saving Changes...' : '💾 Save Profile Information'}
        </button>
      </div>
    </div>
  );
};

export default SkillBuilder;
