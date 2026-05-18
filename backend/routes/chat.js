const express = require('express');
const { readData } = require('../utils/fileHandler');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get chat history for a specific activity
router.get('/:activityId', authenticateToken, async (req, res) => {
  try {
    const { activityId } = req.params;
    const messages = await readData('messages.json');
    const activityMessages = messages.filter(m => m.activityId === activityId);
    res.json(activityMessages);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
