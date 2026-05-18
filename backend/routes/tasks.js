const express = require('express');
const { readData, writeData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');
const { sendTaskAssignmentEmail } = require('../utils/mailer');

const router = express.Router();

// Get all tasks for an organizer
router.get('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can manage tasks' });
    }

    const tasks = await readData('tasks.json');
    const organizerTasks = tasks.filter(t => t.organizerId === req.user.id);
    res.json(organizerTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create a new task (Organizer only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can create tasks' });
    }

    const { title, description, deadline, priority, assignedTo, activityId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const tasks = await readData('tasks.json');

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      deadline: deadline || null,
      priority: priority || 'medium',
      organizerId: req.user.id,
      assignedTo: assignedTo || null,
      status: assignedTo ? 'assigned' : 'unassigned',
      createdAt: new Date().toISOString(),
      activityId: activityId || null
    };

    // If assigned to someone by email, validate the volunteer exists
    if (assignedTo) {
      const volunteers = await readData('volunteers.json');
      const volunteer = volunteers.find(v => v.email === assignedTo);
      if (!volunteer) {
        return res.status(404).json({ message: `No volunteer found with email: ${assignedTo}` });
      }
      // Store volunteer ID for reference
      newTask.assignedVolunteerId = volunteer.id;
    }

    tasks.push(newTask);
    await writeData('tasks.json', tasks);

    let emailSent = false;
    let emailError = null;

    // Send email notification to the assigned volunteer
    if (assignedTo) {
      try {
        await sendTaskAssignmentEmail(assignedTo, {
          title,
          description,
          deadline,
          priority,
          organizerEmail: req.user.email,
        });
        emailSent = true;
      } catch (error) {
        emailError = error.message;
        console.error(`Failed to send assignment email to ${assignedTo}:`, error.message);
      }
    }

    res.status(201).json({ ...newTask, emailSent, emailError });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Assign a task to a volunteer by email
router.patch('/:id/assign', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can assign tasks' });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Volunteer email is required' });
    }

    const volunteers = await readData('volunteers.json');
    const volunteer = volunteers.find(v => v.email === email);

    if (!volunteer) {
      return res.status(404).json({ message: `No volunteer found with email: ${email}` });
    }

    const tasks = await readData('tasks.json');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id && t.organizerId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks[taskIndex].assignedTo = email;
    tasks[taskIndex].assignedVolunteerId = volunteer.id;
    tasks[taskIndex].status = 'assigned';

    await writeData('tasks.json', tasks);

    let emailSent = false;
    let emailError = null;

    // Send email notification to the assigned volunteer
    const task = tasks[taskIndex];
    try {
      await sendTaskAssignmentEmail(email, {
        title: task.title,
        description: task.description,
        deadline: task.deadline,
        priority: task.priority,
        organizerEmail: req.user.email,
      });
      emailSent = true;
    } catch (error) {
      emailError = error.message;
      console.error(`Failed to send assignment email to ${email}:`, error.message);
    }

    res.json({ message: `Task assigned to ${email}`, task: tasks[taskIndex], emailSent, emailError });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Unassign a task
router.patch('/:id/unassign', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can unassign tasks' });
    }

    const tasks = await readData('tasks.json');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id && t.organizerId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks[taskIndex].assignedTo = null;
    tasks[taskIndex].assignedVolunteerId = null;
    tasks[taskIndex].status = 'unassigned';

    await writeData('tasks.json', tasks);

    res.json({ message: 'Task unassigned', task: tasks[taskIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ message: 'Only organizers can delete tasks' });
    }

    const tasks = await readData('tasks.json');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id && t.organizerId === req.user.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);
    await writeData('tasks.json', tasks);

    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get tasks assigned to a volunteer
router.get('/my-tasks', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can view their tasks' });
    }

    const tasks = await readData('tasks.json');
    const myTasks = tasks.filter(t => t.assignedVolunteerId === req.user.id);
    res.json(myTasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle Task Completion and check badges (Volunteer or Organizer)
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const tasks = await readData('tasks.json');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = tasks[taskIndex];

    // Check authorization: only the assigned volunteer or the organizer who created it can modify it
    if (req.user.role === 'volunteer' && task.assignedVolunteerId !== req.user.id) {
      return res.status(403).json({ message: 'You are not assigned to this task' });
    }
    if (req.user.role === 'organizer' && task.organizerId !== req.user.id) {
      return res.status(403).json({ message: 'You did not create this task' });
    }

    // Toggle completed state
    task.completed = !task.completed;
    tasks[taskIndex] = task;
    await writeData('tasks.json', tasks);

    let earnedBadges = [];
    // If completed is true, run the badge logic
    if (task.completed && task.assignedVolunteerId) {
      const volunteers = await readData('volunteers.json');
      const volunteerIndex = volunteers.findIndex(v => v.id === task.assignedVolunteerId);
      
      if (volunteerIndex !== -1) {
        const volunteer = volunteers[volunteerIndex];
        const completedTasksCount = tasks.filter(t => t.assignedVolunteerId === volunteer.id && t.completed).length;

        volunteer.badges = volunteer.badges || [];
        
        if (completedTasksCount >= 1 && !volunteer.badges.includes('First Step')) {
          volunteer.badges.push('First Step');
        }
        if (completedTasksCount >= 3 && !volunteer.badges.includes('Task Master')) {
          volunteer.badges.push('Task Master');
        }
        if (completedTasksCount >= 5 && !volunteer.badges.includes('Elite Volunteer')) {
          volunteer.badges.push('Elite Volunteer');
        }

        earnedBadges = volunteer.badges;
        await writeData('volunteers.json', volunteers);
      }
    }

    res.json({ message: 'Task status updated', task, badges: earnedBadges });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Claim/apply for an unassigned task (Volunteer only)
router.post('/:id/claim', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can claim tasks' });
    }

    const tasks = await readData('tasks.json');
    const taskIndex = tasks.findIndex(t => t.id === req.params.id);

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const task = tasks[taskIndex];

    if (task.assignedTo || task.assignedVolunteerId) {
      return res.status(400).json({ message: 'Task is already assigned to someone else' });
    }

    // Assign the task to this volunteer
    task.assignedTo = req.user.email;
    task.assignedVolunteerId = req.user.id;
    task.status = 'assigned';
    tasks[taskIndex] = task;
    await writeData('tasks.json', tasks);

    res.json({ message: 'Successfully registered for this task!', task });
  } catch (error) {
    console.error('Error claiming task:', error.stack || error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
