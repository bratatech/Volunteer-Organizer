const express = require('express');
const { readData, writeData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all activities (with embedded tasks)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const activities = await readData('activities.json');
    const tasks = await readData('tasks.json');

    const activitiesWithTasks = activities.map(activity => {
      const activityTasks = tasks.filter(t => t.activityId === activity.id);
      return { ...activity, tasks: activityTasks };
    });

    res.json(activitiesWithTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Explore Route for volunteers to browse available opportunities (activities and open tasks)
router.get('/explore', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can access the explore feed' });
    }

    const activities = await readData('activities.json');
    const tasks = await readData('tasks.json');

    // Filter out activities that the volunteer has already applied to (pending, approved, or rejected)
    const availableActivities = activities.filter(activity => {
      const hasApplied = activity.volunteers && activity.volunteers.some(v => v.volunteerId === req.user.id);
      return !hasApplied;
    });

    // Get all unassigned tasks (status === 'unassigned' or assignedTo === null)
    const unassignedTasks = tasks.filter(task => {
      return task.status === 'unassigned' || !task.assignedTo;
    });

    res.json({
      activities: availableActivities,
      tasks: unassignedTasks
    });
  } catch (error) {
    console.error('Error in /explore:', error.stack || error);
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

// Apply to join activity (Volunteer only)
const handleApply = async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can apply for activities' });
    }

    const { taskId } = req.body;
    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(a => a.id === req.params.id);

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const activity = activities[activityIndex];

    // Check if already applied (for this activity generally or for this specific task)
    const existingApp = activity.volunteers.find(v => v.volunteerId === req.user.id && v.taskId === (taskId || null));
    if (existingApp) {
      return res.status(400).json({ message: 'Already applied for this opportunity' });
    }

    activity.volunteers.push({ volunteerId: req.user.id, status: 'pending', taskId: taskId || null });
    activities[activityIndex] = activity;
    await writeData('activities.json', activities);

    // Update volunteer's activities
    const volunteers = await readData('volunteers.json');
    const volunteerIndex = volunteers.findIndex(v => v.id === req.user.id);
    if (volunteerIndex !== -1) {
      if (!volunteers[volunteerIndex].activities) {
        volunteers[volunteerIndex].activities = [];
      }
      volunteers[volunteerIndex].activities.push({ 
        activityId: req.params.id, 
        status: 'pending', 
        taskId: taskId || null 
      });
      await writeData('volunteers.json', volunteers);
    }

    res.json({ message: 'Successfully applied for activity', activity });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

router.post('/:id/apply', authenticateToken, handleApply);
router.post('/:id/join', authenticateToken, handleApply);

// Get volunteers for an activity (returns name/email details, status and skills)
router.get('/:id/volunteers', authenticateToken, async (req, res) => {
  try {
    const activities = await readData('activities.json');
    const activity = activities.find(a => a.id === req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    const volunteers = await readData('volunteers.json');
    const volunteerDetails = activity.volunteers.map(vObj => {
      const v = volunteers.find(vol => vol.id === vObj.volunteerId);
      if (!v) return { id: vObj.volunteerId, email: 'Unknown', rollNo: '', status: vObj.status, skills: [] };
      return { 
        id: v.id, 
        email: v.email, 
        rollNo: v.rollNo || '', 
        phoneNo: v.phoneNo || '',
        status: vObj.status, 
        skills: v.skills || [],
        interests: v.interests || [],
        socialHandles: v.socialHandles || {},
        badges: v.badges || []
      };
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

// Update volunteer application status (Organizer only)
router.patch('/:id/applications/:volunteerId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can update application status' });
    }

    let status = req.body.status;
    const { action } = req.body;
    if (action) {
      if (action === 'approve') status = 'approved';
      if (action === 'reject') status = 'rejected';
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid action or status. Must be approve/reject or approved/rejected.' });
    }

    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(a => a.id === req.params.id && a.organizerId === req.user.id);

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found or not owned by you' });
    }

    // Find all pending applications for this volunteer in this activity
    const volunteerApps = activities[activityIndex].volunteers.filter(
      v => v.volunteerId === req.params.volunteerId && v.status === 'pending'
    );

    if (volunteerApps.length === 0) {
      // Fallback: look for any application if no pending one is found
      const anyApp = activities[activityIndex].volunteers.find(v => v.volunteerId === req.params.volunteerId);
      if (!anyApp) {
        return res.status(404).json({ message: 'Volunteer application not found' });
      }
      anyApp.status = status;
    } else {
      for (const app of volunteerApps) {
        app.status = status;

        // If approved and the application was for a specific task within that activity,
        // automatically assign that volunteer's ID to the task's assignedTo field in tasks.json.
        if (status === 'approved' && app.taskId) {
          const tasks = await readData('tasks.json');
          const taskIndex = tasks.findIndex(t => t.id === app.taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex].assignedTo = req.params.volunteerId;
            tasks[taskIndex].status = 'assigned';
            await writeData('tasks.json', tasks);
          }
        }
      }
    }

    await writeData('activities.json', activities);

    // Update volunteer's activities list
    const volunteers = await readData('volunteers.json');
    const volunteerIndex = volunteers.findIndex(v => v.id === req.params.volunteerId);
    if (volunteerIndex !== -1) {
      const volActivities = volunteers[volunteerIndex].activities || [];
      volActivities.forEach(a => {
        if (a.activityId === req.params.id && a.status === 'pending') {
          a.status = status;
        }
      });
      volunteers[volunteerIndex].activities = volActivities;
      await writeData('volunteers.json', volunteers);
    }

    res.json({ message: `Application ${status} successfully` });
  } catch (error) {
    console.error('Error in PATCH applications status:', error.stack || error);
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

    if (!activities[activityIndex].volunteers.find(v => v.volunteerId === volunteer.id && v.status === 'approved')) {
      return res.status(400).json({ message: 'This volunteer has not been approved for this activity' });
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
    const tasks = await readData('tasks.json');

    if (req.user.role === 'volunteer') {
      const volunteers = await readData('volunteers.json');
      const volunteer = volunteers.find(v => v.id === req.user.id);
      
      const myActivities = activities.map(activity => {
        const joinedActivity = volunteer.activities.find(a => a.activityId === activity.id);
        if (joinedActivity) {
          const activityTasks = tasks.filter(t => t.activityId === activity.id);
          return { ...activity, userStatus: joinedActivity.status, tasks: activityTasks };
        }
        return null;
      }).filter(a => a !== null);

      res.json(myActivities);
    } else {
      const myActivities = activities.filter(a => a.organizerId === req.user.id).map(activity => {
        const activityTasks = tasks.filter(t => t.activityId === activity.id);
        return { ...activity, tasks: activityTasks };
      });
      res.json(myActivities);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Cascade Delete Activity (DELETE /api/activities/:id) (Organizer only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can delete activities' });
    }

    const activityId = req.params.id;
    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(a => a.id === activityId && a.organizerId === req.user.id);

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found or not owned by you' });
    }

    // 1. Remove the activity from activities.json
    activities.splice(activityIndex, 1);
    await writeData('activities.json', activities);

    // 2. Iterate through tasks.json and delete any tasks associated with this activityId
    const tasks = await readData('tasks.json');
    const updatedTasks = tasks.filter(t => t.activityId !== activityId);
    await writeData('tasks.json', updatedTasks);

    // 3. Remove the activity's chat history from messages.json
    const messages = await readData('messages.json');
    const updatedMessages = messages.filter(m => m.activityId !== activityId);
    await writeData('messages.json', updatedMessages);

    // 4. Iterate through volunteers.json and remove this activityId from the activities array of any volunteer who applied for it
    const volunteers = await readData('volunteers.json');
    let volunteersUpdated = false;
    const updatedVolunteers = volunteers.map(volunteer => {
      if (volunteer.activities && volunteer.activities.some(act => act.activityId === activityId)) {
        volunteer.activities = volunteer.activities.filter(act => act.activityId !== activityId);
        volunteersUpdated = true;
      }
      return volunteer;
    });
    if (volunteersUpdated) {
      await writeData('volunteers.json', updatedVolunteers);
    }

    // 5. Remove the activity from the organizer's eventsCreated array in organizers.json
    const organizers = await readData('organizers.json');
    const organizerIndex = organizers.findIndex(o => o.id === req.user.id);
    if (organizerIndex !== -1 && organizers[organizerIndex].eventsCreated) {
      organizers[organizerIndex].eventsCreated = organizers[organizerIndex].eventsCreated.filter(id => id !== activityId);
      await writeData('organizers.json', organizers);
    }

    res.json({ message: 'Activity and all related tasks, chats, and applications deleted successfully.' });
  } catch (error) {
    console.error('Error deleting activity:', error.stack || error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Conclude Activity & Issue Certifications (POST /api/activities/:id/conclude) (Organizer only)
router.post('/:id/conclude', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can conclude activities' });
    }

    const { certifiedVolunteerIds } = req.body;
    if (!Array.isArray(certifiedVolunteerIds)) {
      return res.status(400).json({ message: 'certifiedVolunteerIds must be an array' });
    }

    const activities = await readData('activities.json');
    const activityIndex = activities.findIndex(a => a.id === req.params.id && a.organizerId === req.user.id);

    if (activityIndex === -1) {
      return res.status(404).json({ message: 'Activity not found or not owned by you' });
    }

    const activity = activities[activityIndex];
    if (activity.status === 'ended') {
      return res.status(400).json({ message: 'Activity has already been concluded' });
    }

    // 1. Update activity status to 'ended'
    activity.status = 'ended';
    activities[activityIndex] = activity;
    await writeData('activities.json', activities);

    // 2. Load organizers data to get the organizer's name
    const organizers = await readData('organizers.json');
    const organizer = organizers.find(o => o.id === req.user.id);
    const organizerName = organizer ? (organizer.name || req.user.email.split('@')[0]) : req.user.email.split('@')[0];

    // 3. Issue certificates to the selected volunteers
    const volunteers = await readData('volunteers.json');
    const todayStr = new Date().toISOString().split('T')[0];

    let issuedCount = 0;
    const updatedVolunteers = volunteers.map(volunteer => {
      if (certifiedVolunteerIds.includes(volunteer.id)) {
        volunteer.certifications = volunteer.certifications || [];
        
        // Check if certificate for this activity is already issued to avoid double-issuing
        const alreadyIssued = volunteer.certifications.some(c => c.activityId === activity.id);
        if (!alreadyIssued) {
          // Determine volunteer's role in this activity
          const isLeader = activity.leaderEmail === volunteer.email;
          const role = isLeader ? 'Team Lead' : 'Volunteer';

          // Generate a clean unique certificate ID (e.g. CERT-ABC12345)
          const randomHex = Math.random().toString(36).substring(2, 7).toUpperCase();
          const timestampHex = Date.now().toString().slice(-4);
          const certId = `CERT-${randomHex}${timestampHex}`;

          volunteer.certifications.push({
            id: certId,
            activityId: activity.id,
            activityName: activity.title,
            role: role,
            dateIssued: todayStr,
            issuingOrganizer: organizerName
          });
          issuedCount++;
        }
      }
      return volunteer;
    });

    if (issuedCount > 0) {
      await writeData('volunteers.json', updatedVolunteers);
    }

    res.json({
      message: `Activity concluded successfully! Issued ${issuedCount} certifications.`,
      activity: activities[activityIndex]
    });
  } catch (error) {
    console.error('Error concluding activity:', error.stack || error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
