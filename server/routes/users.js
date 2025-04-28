const express = require('express');
const { getUser, updateUser, getAllUsers } = require('../data/mockDB'); // ✅ import all 3
const router = express.Router();

// Get all users
router.get('/', (req, res) => {
  const users = getAllUsers();
  res.json(users);
});

// Get a user by Steam ID
router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user info (region, rank, roles, etc.)
router.post('/:id/edit', (req, res) => {
  console.log(`⚡️ Received edit request for user ${req.params.id} with data:`, req.body);

  const updated = updateUser(req.params.id, req.body);
  if (!updated) {
    console.log("❌ Failed to update user");
    return res.status(404).json({ message: 'User not found or update failed' });
  }

  const user = getUser(req.params.id);

  // ✅ Update session user if necessary
  if (req.user && req.user.steamId === user.steamId) {
    Object.assign(req.user, user);
    console.log('✅ Session req.user updated too:', req.user);
  }

  res.json({ message: 'User updated successfully', user });
});

module.exports = router;
