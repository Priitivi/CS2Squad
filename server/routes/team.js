const express = require('express');
const db = require('../data/db');
const router = express.Router();

// ✅ Create a new team
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

    res.status(200).json({ message: "Team created successfully" });
  } catch (err) {
    console.error("❌ Failed to create team:", err);
    res.status(500).json({ message: "Server error creating team" });
  }
});

// ✅ Add a teammate
router.post('/:steamId/:teamName/add-teammate', async (req, res) => {
  const { steamId, teamName } = req.params;
  const { teammateId } = req.body;

  console.log("🚀 Add teammate request:", { steamId, teamName, teammateId });

  if (!teammateId || !steamId || !teamName) {
    return res.status(400).json({ message: "Missing data" });
  }

  try {
    const result = await db.query(
      `SELECT * FROM teams WHERE owner_id = $1 AND name = $2`,
      [steamId, teamName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = result.rows[0];
    const currentMembers = team.members || [];

    if (currentMembers.includes(teammateId)) {
      return res.status(400).json({ message: "Teammate already added" });
    }

    const updatedMembers = [...currentMembers, teammateId];

    await db.query(
      `UPDATE teams SET members = $1 WHERE id = $2`,
      [updatedMembers, team.id]
    );

    console.log(`✅ Added ${teammateId} to team '${team.name}' (team ID: ${team.id})`);

    res.status(200).json({
      message: "Teammate added",
      team: { ...team, members: updatedMembers },
    });
  } catch (err) {
    console.error("❌ Error adding teammate:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Remove a teammate
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
    const updatedMembers = (team.members || []).filter(id => id !== teammateId);

    await db.query(
      `UPDATE teams SET members = $1 WHERE id = $2`,
      [updatedMembers, team.id]
    );

    console.log(`🗑️ Removed ${teammateId} from team '${team.name}'`);

    res.status(200).json({
      message: "Teammate removed",
      team: { ...team, members: updatedMembers },
    });
  } catch (err) {
    console.error("❌ Error removing teammate:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Delete a team
router.delete('/:steamId/:teamIndex', async (req, res) => {
  const { steamId, teamIndex } = req.params;

  try {
    const result = await db.query(
      `SELECT * FROM teams WHERE owner_id = $1 ORDER BY created_at`,
      [steamId]
    );

    if (result.rows.length === 0 || !result.rows[teamIndex]) {
      return res.status(404).json({ message: "Team not found" });
    }

    const team = result.rows[teamIndex];

    await db.query(`DELETE FROM teams WHERE id = $1`, [team.id]);

    console.log(`🗑️ Deleted team '${team.name}' (ID: ${team.id})`);

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting team:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
