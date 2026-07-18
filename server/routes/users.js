const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { toPlayer, toTeam } = require('../utils/mappers');
const { cleanProfileInput, cleanRank, normalizeSteamId, parsePagination, REGIONS, ROLES } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = [`(
      u.profile_visibility = 'public' OR u.steam_id = $1 OR
      (u.profile_visibility = 'members' AND EXISTS (
        SELECT 1 FROM teams shared
        WHERE (shared.owner_id = u.steam_id OR u.steam_id = ANY(shared.members))
          AND (shared.owner_id = $1 OR $1 = ANY(shared.members))
      ))
    )`];
    const values = [req.user.steamId];
    const add = (clause, value) => {
      values.push(value);
      where.push(clause.replace('?', `$${values.length}`));
    };

    if (req.query.search) add(`LOWER(u.username) LIKE ?`, `%${String(req.query.search).trim().toLowerCase().slice(0, 64)}%`);
    if (req.query.region && REGIONS.includes(req.query.region)) add(`u.region = ?`, req.query.region);
    if (req.query.role && ROLES.includes(req.query.role)) add(`? = ANY(u.roles)`, req.query.role);
    if (req.query.language) add(`LOWER(u.language) = ?`, String(req.query.language).trim().toLowerCase().slice(0, 40));
    if (req.query.availability) add(`? = ANY(u.availability)`, String(req.query.availability).slice(0, 40));
    if (req.query.recruiting === 'true') where.push('u.recruitment_status = TRUE');
    const rankMin = cleanRank(req.query.rankMin);
    const rankMax = cleanRank(req.query.rankMax);
    if (rankMin !== undefined && rankMin !== null) add(`u.rank >= ?`, rankMin);
    if (rankMax !== undefined && rankMax !== null) add(`u.rank <= ?`, rankMax);

    const countResult = await db.query(`SELECT COUNT(*)::int AS count FROM users u WHERE ${where.join(' AND ')}`, values);
    values.push(limit, offset);
    const result = await db.query(
      `SELECT u.*,
        current_team.id AS current_team_id,
        current_team.name AS current_team_name
       FROM users u
       LEFT JOIN LATERAL (
         SELECT id, name FROM teams
         WHERE owner_id = u.steam_id OR u.steam_id = ANY(members)
         ORDER BY created_at DESC LIMIT 1
       ) current_team ON TRUE
       WHERE ${where.join(' AND ')}
       ORDER BY u.recruitment_status DESC, u.updated_at DESC, u.username ASC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    const total = Number(countResult.rows[0]?.count || 0);
    return res.json({
      players: result.rows.map(toPlayer),
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const steamId = normalizeSteamId(req.params.id);
    if (!steamId) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid Steam identifier.' });
    const result = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
    if (!result.rows.length) return res.status(404).json({ code: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
    const row = result.rows[0];
    if (row.profile_visibility === 'private' && steamId !== req.user.steamId) {
      return res.status(403).json({ code: 'PROFILE_PRIVATE', message: 'This player profile is private.' });
    }
    if (row.profile_visibility === 'members' && steamId !== req.user.steamId) {
      const sharedTeam = await db.query(
        `SELECT 1 FROM teams
         WHERE (owner_id = $1 OR $1 = ANY(members))
           AND (owner_id = $2 OR $2 = ANY(members)) LIMIT 1`,
        [steamId, req.user.steamId]
      );
      if (!sharedTeam.rows.length) {
        return res.status(403).json({ code: 'PROFILE_MEMBERS_ONLY', message: 'This profile is visible to teammates only.' });
      }
    }
    const teamsResult = await db.query(
      `SELECT t.*, owner.username AS owner_name, cardinality(t.members) + 1 AS member_count
       FROM teams t JOIN users owner ON owner.steam_id = t.owner_id
       WHERE t.owner_id = $1 OR $1 = ANY(t.members) ORDER BY t.created_at DESC`,
      [steamId]
    );
    return res.json({ ...toPlayer(row), teams: teamsResult.rows.map(toTeam) });
  } catch (error) {
    return next(error);
  }
});

async function updateProfile(req, res, next, targetId) {
  try {
    const steamId = normalizeSteamId(targetId);
    if (!steamId) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid Steam identifier.' });
    if (steamId !== req.user.steamId) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only edit your own profile.' });
    }
    const parsed = cleanProfileInput(req.body);
    if (parsed.error) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error });

    const entries = Object.entries(parsed.values);
    const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
    const values = entries.map(([, value]) => value);
    const placeholders = new Map(entries.map(([key], index) => [key, `$${index + 1}`]));
    const effective = (key) => placeholders.get(key) || key;
    values.push(steamId);
    const result = await db.query(
      `UPDATE users SET ${assignments.join(', ')},
        profile_completed = (
          COALESCE(${effective('region')}, '') <> '' AND ${effective('rank')} IS NOT NULL AND
          cardinality(COALESCE(${effective('roles')}, '{}')) > 0 AND COALESCE(${effective('language')}, '') <> ''
        ),
        updated_at = NOW()
       WHERE steam_id = $${values.length}
       RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ code: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
    return res.json({ message: 'Profile updated.', user: toPlayer(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
}

router.patch('/me/profile', (req, res, next) => updateProfile(req, res, next, req.user.steamId));
router.post('/:id/edit', (req, res, next) => updateProfile(req, res, next, req.params.id));

module.exports = router;
