const ActivityCard = ({ activity, onJoin, isVolunteer, showJoinButton = false }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card hover:scale-105 transition-transform duration-300">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">{activity.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
          activity.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {activity.status}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">{activity.description}</p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">📅 Date:</span>
          <span>{formatDate(activity.date)}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">📍 Location:</span>
          <span>{activity.location}</span>
        </div>
        <div className="flex items-center text-gray-700">
          <span className="font-semibold mr-2">👥 Volunteers:</span>
          <span>{activity.volunteers.length} / {activity.volunteersNeeded || 'Unlimited'}</span>
        </div>
      </div>
      
      {showJoinButton && isVolunteer && (
        <button
          onClick={() => onJoin(activity.id)}
          className="w-full btn-primary"
        >
          Join Activity
        </button>
      )}
    </div>
  );
};

export default ActivityCard;
