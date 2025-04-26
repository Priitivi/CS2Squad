const express = require('express');
const { getUser, addTeamToUser } = require('../data/mockDB');
const router = express.Router();

// Updated route to match frontend
router.post('/:steamId/create-team', (req, res) => {
  const { name, members } = req.body;
  const { steamId } = req.params;

  if (!steamId || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const team = {
    name,
    members: members || [],
    createdAt: new Date(),
  };

  const success = addTeamToUser(steamId, team);

  if (!success) {
    return res.status(404).json({ message: "User not found" });
  }

  // ✅ After adding, update the session req.user.teams too
  const user = getUser(steamId);
  if (req.user && req.user.steamId === user.steamId) {
    req.user.teams = user.teams;
    console.log('✅ Session user teams updated:', req.user.teams);
  }

  return res.status(200).json({ message: "Team created successfully", team });
});

module.exports = router;
