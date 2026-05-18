const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Volunteer Signup
router.post('/volunteer/signup', async (req, res) => {
  try {
    const { email, password, rollNo, phoneNo, skills, interests, socialHandles } = req.body;

    // Validation
    if (!email || !password || !rollNo || !phoneNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is a college email
    if (!email.endsWith('.edu.in')) {
      return res.status(400).json({ message: 'Please use a valid college email' });
    }

    const volunteers = await readData('volunteers.json');

    // Check if volunteer already exists
    if (volunteers.find(v => v.email === email)) {
      return res.status(400).json({ message: 'Volunteer already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newVolunteer = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      rollNo,
      phoneNo,
      role: 'volunteer',
      createdAt: new Date().toISOString(),
      skills: skills || [],
      interests: interests || [],
      socialHandles: socialHandles || {},
      badges: [],
      activities: []
    };

    volunteers.push(newVolunteer);
    await writeData('volunteers.json', volunteers);

    res.status(201).json({ message: 'Volunteer registered successfully' });
  } catch (error) {
    console.error('Error in /volunteer/signup:', error.stack || error);
    res.status(500).json({
      message: 'Server error: A critical database or file access error occurred during volunteer registration.',
      error: error.message,
      stack: error.stack
    });
  }
});

// Volunteer Login
router.post('/volunteer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const volunteers = await readData('volunteers.json');
    const volunteer = volunteers.find(v => v.email === email);

    if (!volunteer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, volunteer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: volunteer.id, email: volunteer.email, role: 'volunteer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: volunteer.id,
        email: volunteer.email,
        rollNo: volunteer.rollNo,
        phoneNo: volunteer.phoneNo,
        role: 'volunteer',
        skills: volunteer.skills || [],
        interests: volunteer.interests || [],
        socialHandles: volunteer.socialHandles || {},
        badges: volunteer.badges || []
      }
    });
  } catch (error) {
    console.error('Error in /volunteer/login:', error.stack || error);
    res.status(500).json({
      message: 'Server error: A critical database or file access error occurred during volunteer login.',
      error: error.message,
      stack: error.stack
    });
  }
});

// Organizer Signup
router.post('/organizer/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const organizers = await readData('organizers.json');

    if (organizers.find(o => o.email === email)) {
      return res.status(400).json({ message: 'Organizer already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganizer = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      role: 'organizer',
      createdAt: new Date().toISOString(),
      eventsCreated: []
    };

    organizers.push(newOrganizer);
    await writeData('organizers.json', organizers);

    res.status(201).json({ message: 'Organizer registered successfully' });
  } catch (error) {
    console.error('Error in /organizer/signup:', error.stack || error);
    res.status(500).json({
      message: 'Server error: A critical database or file access error occurred during organizer registration.',
      error: error.message,
      stack: error.stack
    });
  }
});

// Organizer Login
router.post('/organizer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const organizers = await readData('organizers.json');
    const organizer = organizers.find(o => o.email === email);

    if (!organizer) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, organizer.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: organizer.id, email: organizer.email, role: 'organizer' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: organizer.id,
        email: organizer.email,
        role: 'organizer'
      }
    });
  } catch (error) {
    console.error('Error in /organizer/login:', error.stack || error);
    res.status(500).json({
      message: 'Server error: A critical database or file access error occurred during organizer login.',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get Volunteer Profile
router.get('/volunteer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can access this profile' });
    }

    const volunteers = await readData('volunteers.json');
    const volunteer = volunteers.find(v => v.id === req.user.id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.json({
      user: {
        id: volunteer.id,
        email: volunteer.email,
        rollNo: volunteer.rollNo,
        phoneNo: volunteer.phoneNo,
        role: 'volunteer',
        skills: volunteer.skills || [],
        interests: volunteer.interests || [],
        socialHandles: volunteer.socialHandles || {},
        badges: volunteer.badges || [],
        points: volunteer.points || 0,
        certifications: volunteer.certifications || [],
        activities: volunteer.activities || []
      }
    });
  } catch (error) {
    console.error('Error fetching volunteer profile:', error.stack || error);
    res.status(500).json({ message: 'Server error fetching profile data', error: error.message });
  }
});

// Update Volunteer Profile
router.put('/volunteer/profile', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can update their profile' });
    }

    const { skills, interests, socialHandles } = req.body;
    const volunteers = await readData('volunteers.json');
    const volunteerIndex = volunteers.findIndex(v => v.id === req.user.id);

    if (volunteerIndex === -1) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Update fields
    volunteers[volunteerIndex].skills = skills || volunteers[volunteerIndex].skills || [];
    volunteers[volunteerIndex].interests = interests || volunteers[volunteerIndex].interests || [];
    volunteers[volunteerIndex].socialHandles = socialHandles || volunteers[volunteerIndex].socialHandles || {};

    await writeData('volunteers.json', volunteers);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: volunteers[volunteerIndex].id,
        email: volunteers[volunteerIndex].email,
        rollNo: volunteers[volunteerIndex].rollNo,
        phoneNo: volunteers[volunteerIndex].phoneNo,
        role: 'volunteer',
        skills: volunteers[volunteerIndex].skills,
        interests: volunteers[volunteerIndex].interests,
        socialHandles: volunteers[volunteerIndex].socialHandles,
        badges: volunteers[volunteerIndex].badges || []
      }
    });
  } catch (error) {
    console.error('Error in /volunteer/profile:', error.stack || error);
    res.status(500).json({
      message: 'Server error: A critical database or file access error occurred during profile update.',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
