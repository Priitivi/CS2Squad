const express = require('express');
const { getUser, addTeamToUser } = require('../data/mockDB');
const router = express.Router();

// Create a new team
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

  const user = getUser(steamId);
  if (req.user && req.user.steamId === user.steamId) {
    req.user.teams = user.teams;
    console.log('✅ Session user teams updated:', req.user.teams);
  }

  return res.status(200).json({ message: "Team created successfully", team });
});

// 🔥 Add teammate to a specific team
router.post('/:steamId/:teamName/add-teammate', (req, res) => {
  const { steamId, teamName } = req.params;
  const { teammateId } = req.body;

  const user = getUser(steamId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const team = user.teams.find(t => t.name === teamName);
  if (!team) return res.status(404).json({ message: "Team not found" });

  if (team.members.includes(teammateId)) {
    return res.status(400).json({ message: "Teammate already added" });
  }

  team.members.push(teammateId);

  console.log(`✅ Added teammate ${teammateId} to team ${teamName}`);
  return res.status(200).json({ message: "Teammate added", team });
});

// 🔥 Remove teammate from a specific team
router.post('/:steamId/:teamName/remove-teammate', (req, res) => {
  const { steamId, teamName } = req.params;
  const { teammateId } = req.body;

  const user = getUser(steamId);
  if (!user) return res.status(404).json({ message: "User not found" });

  const team = user.teams.find(t => t.name === teamName);
  if (!team) return res.status(404).json({ message: "Team not found" });

  team.members = team.members.filter(id => id !== teammateId);

  console.log(`✅ Removed teammate ${teammateId} from team ${teamName}`);
  return res.status(200).json({ message: "Teammate removed", team });
});


// ✅ Delete a team by its index
router.delete('/:steamId/:teamIndex', (req, res) => {
  const { steamId, teamIndex } = req.params;
  const user = getUser(steamId);

  if (!user || !user.teams) {
    return res.status(404).json({ message: "User not found or no teams" });
  }

  const index = parseInt(teamIndex, 10);
  if (isNaN(index) || index < 0 || index >= user.teams.length) {
    return res.status(400).json({ message: "Invalid team index" });
  }

  // ✅ Remove the team
  const deletedTeam = user.teams.splice(index, 1);

  // Also update session user
  if (req.user && req.user.steamId === user.steamId) {
    req.user.teams = user.teams;
  }

  console.log(`🗑️ Deleted team ${deletedTeam[0].name} (index ${index})`);

  return res.status(200).json({ message: "Team deleted successfully" });
});



module.exports = router;
