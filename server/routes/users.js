const express = require('express');
const { getUser, updateUser, getAllUsers } = require('../data/realDB'); // ✅ Real database now
const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  const users = await getAllUsers();
  res.json(users);
});

// Get user by Steam ID
router.get('/:id', async (req, res) => {
  const user = await getUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user info
router.post('/:id/edit', async (req, res) => {
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
