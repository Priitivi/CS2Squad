const express = require('express');
const jwt = require('jsonwebtoken');
const { getUser, updateUser, getAllUsers } = require('../data/realDB');

const router = express.Router();

// ✅ JWT Middleware
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// ✅ Get all users (protected)
router.get('/', verifyToken, async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// ✅ Get user by Steam ID (protected)
router.get('/:id', verifyToken, async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// ✅ Update user info (protected)
router.post('/:id/edit', verifyToken, async (req, res) => {
  console.log(`⚡️ Received edit request for user ${req.params.id} with data:`, req.body);

  const success = await updateUser(req.params.id, req.body);
  if (!success) {
    console.log("❌ Failed to update user");
    return res.status(404).json({ message: 'User not found or update failed' });
  }

  const user = await getUser(req.params.id);

  if (req.user && req.user.steamId === user.steamId) {
    Object.assign(req.user, user);
    console.log('✅ Session req.user updated too:', req.user);
  }

  res.json({ message: 'User updated successfully', user });
});

module.exports = router;
