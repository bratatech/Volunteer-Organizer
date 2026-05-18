const jwt = require('jsonwebtoken');
const { readData } = require('../utils/fileHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    try {
      const dbFile = decoded.role === 'volunteer' ? 'volunteers.json' : 'organizers.json';
      const users = await readData(dbFile);

      const userExists = users.some(u => u.id === decoded.id);

      if (!userExists) {
        return res.status(401).json({ message: 'Session invalid. User account no longer exists.' });
      }

      req.user = decoded;
      next();
    } catch (dbError) {
      console.error('Database verification error:', dbError);
      return res.status(500).json({ message: 'Internal server verification error' });
    }
  });
};

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };
