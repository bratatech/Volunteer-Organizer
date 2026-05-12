const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readData, writeData } = require('../utils/fileHandler');

const router = express.Router();

// Volunteer Signup
router.post('/volunteer/signup', async (req, res) => {
  try {
    const { email, password, rollNo, phoneNo } = req.body;

    // Validation
    if (!email || !password || !rollNo || !phoneNo) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email is a college email
    if (!email.endsWith('.edu')) {
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
      activities: []
    };

    volunteers.push(newVolunteer);
    await writeData('volunteers.json', volunteers);

    res.status(201).json({ message: 'Volunteer registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
        role: 'volunteer'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
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
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
