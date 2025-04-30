// server/data/realDB.js

const db = require('./db');

// Get a single user by Steam ID
async function getUser(steamId) {
  const { rows } = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
  return rows[0];
}

// Get all users
async function getAllUsers() {
  const { rows } = await db.query(`
    SELECT steam_id, username, avatar, region, rank
    FROM users
  `);

  return rows.map(row => ({
    steamId: row.steam_id,
    username: row.username,
    avatar: row.avatar,
    region: row.region,
    rank: row.rank,
  }));
}


// Add a user (during first login)
async function addUser(user) {
  await db.query(`
    INSERT INTO users (steam_id, username, avatar, region, rank, roles, availability)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (steam_id) DO NOTHING
  `, [
    user.steamId,
    user.username,
    user.avatar,
    user.region || '',
    user.rank || '',
    user.roles || [],
    user.availability || [],
  ]);
}

// Update a user (for Edit Profile)
async function updateUser(steamId, updatedFields) {
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, value] of Object.entries(updatedFields)) {
    fields.push(`${key} = $${idx}`);
    values.push(value);
    idx++;
  }

  if (fields.length === 0) return false;

  await db.query(`
    UPDATE users SET ${fields.join(', ')}
    WHERE steam_id = $${idx}
  `, [...values, steamId]);

  return true;
}

// Add a team
async function addTeamToUser(steamId, team) {
  await db.query(`
    INSERT INTO teams (user_steam_id, name, members)
    VALUES ($1, $2, $3)
  `, [steamId, team.name, team.members]);
}

// Delete a team
async function deleteTeam(steamId, teamIndex) {
  const { rows } = await db.query(`
    SELECT id FROM teams
    WHERE user_steam_id = $1
    ORDER BY id
    OFFSET $2 LIMIT 1
  `, [steamId, teamIndex]);

  const team = rows[0];
  if (!team) return false;

  await db.query('DELETE FROM teams WHERE id = $1', [team.id]);
  return true;
}

module.exports = {
  getUser,
  getAllUsers,
  addUser,
  updateUser,
  addTeamToUser,
  deleteTeam,
};
