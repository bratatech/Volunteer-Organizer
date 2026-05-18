import React from 'react';

const BadgeShowcase = ({ badges = [] }) => {
  const allBadges = [
    {
      id: 'First Step',
      name: 'First Step',
      icon: '🏅',
      description: 'Awarded for completing your first assigned task!',
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      iconColor: 'bg-emerald-100 text-emerald-800'
    },
    {
      id: 'Task Master',
      name: 'Task Master',
      icon: '🏆',
      description: 'Awarded for completing 3 or more volunteer tasks.',
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
      iconColor: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'Elite Volunteer',
      name: 'Elite Volunteer',
      icon: '👑',
      description: 'Awarded for completing 5 or more volunteer tasks.',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      iconColor: 'bg-amber-100 text-amber-800'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 md:p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
        🏆 Gamification & Badges
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Complete your assigned tasks to unlock rare badges and showcase your fest contribution!
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {allBadges.map((badge) => {
          const isUnlocked = badges.includes(badge.id);
          return (
            <div
              key={badge.id}
              className={`relative flex flex-col items-center text-center p-5 border rounded-xl transition duration-300 ${
                isUnlocked
                  ? `${badge.color} transform hover:-translate-y-1 hover:shadow-md`
                  : 'bg-gray-50/50 border-gray-200 text-gray-400 select-none'
              }`}
            >
              {/* Badge Icon */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-4xl mb-4 shadow-sm ${
                  isUnlocked ? badge.iconColor : 'bg-gray-200/80 text-gray-400'
                }`}
              >
                {badge.icon}
              </div>

              {/* Status Indicator */}
              <div className="absolute top-3 right-3 text-xs font-bold uppercase tracking-wider">
                {isUnlocked ? (
                  <span className="text-green-600 bg-green-100/80 px-2 py-0.5 rounded-full text-[10px]">
                    Unlocked
                  </span>
                ) : (
                  <span className="text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full text-[10px] flex items-center gap-0.5">
                    🔒 Locked
                  </span>
                )}
              </div>

              <h3 className={`text-lg font-bold mb-1.5 ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                {badge.name}
              </h3>
              <p className={`text-xs ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                {badge.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BadgeShowcase;
