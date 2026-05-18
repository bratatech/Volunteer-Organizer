const express = require('express');
const { readData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aggregate overview of active volunteers (Organizer only)
router.get('/volunteer-overview', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can access the volunteer workforce tracker overview.' });
    }

    const volunteers = await readData('volunteers.json');
    const activities = await readData('activities.json');
    const tasks = await readData('tasks.json');

    const overview = volunteers.map(volunteer => {
      // Clean, premium name extraction from email address
      const name = volunteer.email
        .split('@')[0]
        .split('.')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');

      // Find titles of approved activities
      const activeActivities = (volunteer.activities || [])
        .filter(actLink => actLink.status === 'approved')
        .map(actLink => {
          const act = activities.find(a => a.id === actLink.activityId);
          return act ? act.title : 'Unknown Event';
        });

      // Filter and count tasks assigned to this specific volunteer
      const volunteerTasks = tasks.filter(t => t.assignedTo === volunteer.id);
      const completedTasksCount = volunteerTasks.filter(t => t.status === 'completed' || t.completed === true).length;
      const totalAssignedTasksCount = volunteerTasks.length;

      return {
        volunteerId: volunteer.id,
        name,
        email: volunteer.email,
        rollNumber: volunteer.rollNo || '',
        activeActivities,
        completedTasksCount,
        totalAssignedTasksCount,
        badges: volunteer.badges || []
      };
    });

    res.json(overview);
  } catch (error) {
    console.error('Error in /organizers/volunteer-overview:', error.stack || error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
