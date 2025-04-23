const express = require('express');
const { getUser, updateUser } = require('../data/mockDB');

const router = express.Router();

// Get a user by Steam ID
router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// Update user info (region, rank, roles, etc.)
router.post('/:id/edit', (req, res) => {
  const updated = updateUser(req.params.id, req.body);
  if (!updated) return res.status(404).json({ message: 'User not found or update failed' });

  const user = getUser(req.params.id);
  res.json({ message: 'User updated successfully', user });
});

module.exports = router;
