const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { readData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// AI-powered area suggestion for volunteers
router.post('/suggest-area', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'volunteer') {
      return res.status(403).json({ message: 'Only volunteers can use AI suggestions' });
    }

    const { skills, interests } = req.body;

    if (!skills || !interests) {
      return res.status(400).json({ message: 'Skills and interests are required' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: 'Gemini API key is not configured' });
    }

    // Fetch available activities to provide context-aware suggestions
    const activities = await readData('activities.json');
    const upcomingActivities = activities.filter(a => a.status === 'upcoming');

    const activitiesContext = upcomingActivities.length > 0
      ? upcomingActivities.map(a =>
          `- "${a.title}": ${a.description} (Location: ${a.location}, Volunteers needed: ${a.volunteersNeeded}, Date: ${a.date})`
        ).join('\n')
      : 'No upcoming activities available at the moment.';

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an AI assistant for a college volunteer organization. A volunteer has provided their skills and interests. Based on this information, suggest which volunteer area/role they should apply for.

Available upcoming activities in the organization:
${activitiesContext}

Volunteer's Skills: ${skills}
Volunteer's Interests: ${interests}

Please provide:
1. A recommended area/role they should apply for (be specific, reference actual activities if they match)
2. A brief explanation of why this area suits them based on their skills and interests
3. 2-3 specific activities from the list above that best match their profile (if any match), or suggest general areas if no activities are a good fit
4. Any additional skills they might want to develop

Keep the response concise, encouraging, and practical. Format the response clearly with headers.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.json({ suggestion: response });
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ message: 'Failed to generate suggestion', error: error.message });
  }
});

module.exports = router;
