const express = require('express');
const db = require('../data/db');
const router = express.Router();

// Create a new team
router.post('/:steamId/create-team', async (req, res) => {
  const { name, members } = req.body;
  const { steamId } = req.params;

  if (!steamId || !name) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    await db.query(
      `INSERT INTO teams (name, owner_id, members, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [name, steamId, members || []]
    );
    return res.status(200).json({ message: "Team created successfully" });
  } catch (err) {
    console.error("❌ Failed to create team:", err);
    return res.status(500).json({ message: "Server error creating team" });
  }
});

// Add teammate to a team
router.post('/:steamId/:teamName/add-teammate', async (req, res) => {
  const { steamId, teamName } = req.params;
  const { teammateId } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM teams WHERE owner_id = $1 AND name = $2`,
      [steamId, teamName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = result.rows[0];
    if (team.members.includes(teammateId)) {
      return res.status(400).json({ message: "Teammate already added" });
    }

    const updatedMembers = [...team.members, teammateId];
    await db.query(
      `UPDATE teams SET members = $1 WHERE id = $2`,
      [updatedMembers, team.id]
    );

    res.status(200).json({ message: "Teammate added", team: { ...team, members: updatedMembers } });
  } catch (err) {
    console.error("❌ Error adding teammate:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Remove teammate
router.post('/:steamId/:teamName/remove-teammate', async (req, res) => {
  const { steamId, teamName } = req.params;
  const { teammateId } = req.body;

  try {
    const result = await db.query(
      `SELECT * FROM teams WHERE owner_id = $1 AND name = $2`,
      [steamId, teamName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = result.rows[0];
    const updatedMembers = team.members.filter(id => id !== teammateId);

    await db.query(
      `UPDATE teams SET members = $1 WHERE id = $2`,
      [updatedMembers, team.id]
    );

    res.status(200).json({ message: "Teammate removed", team: { ...team, members: updatedMembers } });
  } catch (err) {
    console.error("❌ Error removing teammate:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete team
router.delete('/:steamId/:teamIndex', async (req, res) => {
  const { steamId, teamIndex } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM teams WHERE owner_id = $1 ORDER BY created_at`,
      [steamId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No teams found" });
    }

    const team = result.rows[teamIndex];
    if (!team) {
      return res.status(404).json({ message: "Team index out of range" });
    }

    await db.query(`DELETE FROM teams WHERE id = $1`, [team.id]);

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting team:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
