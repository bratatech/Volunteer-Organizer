const express = require('express');
const { readData, writeData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all activities
router.get('/', authenticateToken, async (req, res) => {
  try {
    const activities = await readData('activities.json');
    res.json(activities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create activity (Organizer only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create activities' });
    }

    const { title, description, date, location, volunteersNeeded, leaderEmail } = req.body;

    if (!title || !description || !date) {
      return res.status(400).json({ message: 'Title, description, and date are required' });
    }

    const activities = await readData('activities.json');

    const newActivity = {
      id: Date.now().toString(),
      title,
      description,
      date,
      location: location || 'TBD',
      volunteersNeeded: volunteersNeeded || 0,
      leaderEmail: leaderEmail || null,
      organizerId: req.user.id,
      volunteers: [],
      status: 'upcoming',
      createdAt: new Date().toISOString()
    };

    activities.push(newActivity);
    await writeData('activities.json', activities);

    // Update organizer's events
    const organizers = await readData('organizers.json');
    const organizerIndex = organizers.findIndex(o => o.id === req.user.id);
    if (organizerIndex !== -1) {
      organizers[organizerIndex].eventsCreated.push(newActivity.id);
      await writeData('organizers.json', organizers);
    }

    res.status(201).json(newActivity);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Join activity (Volunteer only)
router.post('/:id/join', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can join activities' });
    }

    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(a => a.id === req.params.id);

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = activities[activityIndex];

    if (activity.volunteers.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already joined this activity' });
    }

    activity.volunteers.push(req.user.id);
    activities[activityIndex] = activity;
    await writeData('activities.json', activities);

    // Update volunteer's activities
    const volunteers = await readData('volunteers.json');
    const volunteerIndex = volunteers.findIndex(v => v.id === req.user.id);
    if (volunteerIndex !== -1) {
      volunteers[volunteerIndex].activities.push(req.params.id);
      await writeData('volunteers.json', volunteers);
    }

    res.json({ message: 'Successfully joined activity', activity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get volunteers for an activity (returns name/email details)
router.get('/:id/volunteers', authenticateToken, async (req, res) => {
  try {
    const activities = await readData('activities.json');
    const activity = activities.find(a => a.id === req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const volunteers = await readData('volunteers.json');
    const volunteerDetails = activity.volunteers.map(vId => {
      const v = volunteers.find(vol => vol.id === vId);
      if (!v) return { id: vId, email: 'Unknown', rollNo: '' };
      return { id: v.id, email: v.email, rollNo: v.rollNo || '' };
    });

    res.json({
      activityId: activity.id,
      leaderEmail: activity.leaderEmail || null,
      volunteers: volunteerDetails
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign a leader to an activity (Organizer only)
router.patch('/:id/leader', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can assign leaders' });
    }

    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Leader email is required' });
    }

    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(
      a => a.id === req.params.id && a.organizerId === req.user.id
    );

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found or not owned by you' });
    }

    // Verify the volunteer exists and is part of this activity
    const volunteers = await readData('volunteers.json');
    const volunteer = volunteers.find(v => v.email === email);
    if (!volunteer) {
      return res.status(404).json({ message: `No volunteer found with email: ${email}` });
    }

    if (!activities[activityIndex].volunteers.includes(volunteer.id)) {
      return res.status(400).json({ message: 'This volunteer has not joined this activity' });
    }

    activities[activityIndex].leaderEmail = email;
    await writeData('activities.json', activities);

    res.json({ message: `${email} has been assigned as the leader`, activity: activities[activityIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's activities
router.get('/my-activities', authenticateToken, async (req, res) => {
  try {
    const activities = await readData('activities.json');

    if (req.user.role === 'volunteer') {
      const volunteers = await readData('volunteers.json');
      const volunteer = volunteers.find(v => v.id === req.user.id);
      const myActivities = activities.filter(a => volunteer.activities.includes(a.id));
      res.json(myActivities);
    } else {
      const myActivities = activities.filter(a => a.organizerId === req.user.id);
      res.json(myActivities);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
