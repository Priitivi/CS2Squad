const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { toPlayer, toTeam } = require('../utils/mappers');
const { cleanRank, cleanTeamInput, normalizeSteamId, parsePagination, REGIONS, ROLES } = require('../utils/validation');

const router = express.Router();
router.use(requireAuth);

function teamId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

async function getOwnedTeam(id, ownerId) {
  const result = await db.query('SELECT * FROM teams WHERE id = $1 AND owner_id = $2', [id, ownerId]);
  return result.rows[0];
}

async function createTeam(req, res, next, ownerId) {
  try {
    if (ownerId !== req.user.steamId) {
      return res.status(403).json({ code: 'FORBIDDEN', message: 'Teams can only be created for your own account.' });
    }
    const parsed = cleanTeamInput(req.body);
    if (parsed.error) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error });
    const values = parsed.values;
    const result = await db.query(
      `INSERT INTO teams
        (name, owner_id, description, region, rank_min, rank_max, open_roles, recruiting, emblem, members)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, '{}')
       RETURNING *`,
      [
        values.name,
        ownerId,
        values.description || '',
        values.region || '',
        values.rank_min ?? null,
        values.rank_max ?? null,
        values.open_roles || [],
        values.recruiting ?? true,
        values.emblem || 'vanguard',
      ]
    );
    return res.status(201).json({ message: 'Team created.', team: toTeam(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ code: 'TEAM_NAME_EXISTS', message: 'You already own a team with that name.' });
    }
    return next(error);
  }
}

async function sendInvitation(req, res, next, id) {
  try {
    const recipientId = normalizeSteamId(req.body.recipientId || req.body.teammateId);
    if (!recipientId) return res.status(400).json({ code: 'INVALID_ID', message: 'Select a valid player.' });
    if (recipientId === req.user.steamId) {
      return res.status(400).json({ code: 'SELF_INVITE', message: 'You cannot invite yourself.' });
    }
    const team = await getOwnedTeam(id, req.user.steamId);
    if (!team) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found or you are not its owner.' });
    if (String(team.owner_id) === recipientId || (team.members || []).map(String).includes(recipientId)) {
      return res.status(409).json({ code: 'ALREADY_MEMBER', message: 'That player is already on the team.' });
    }
    if ((team.members || []).length >= 4) {
      return res.status(409).json({ code: 'TEAM_FULL', message: 'This team already has five players.' });
    }
    const playerResult = await db.query('SELECT steam_id FROM users WHERE steam_id = $1', [recipientId]);
    if (!playerResult.rows.length) return res.status(404).json({ code: 'PLAYER_NOT_FOUND', message: 'Player not found.' });

    const result = await db.query(
      `INSERT INTO team_invitations (team_id, sender_id, recipient_id)
       VALUES ($1, $2, $3) RETURNING id, status, created_at`,
      [id, req.user.steamId, recipientId]
    );
    return res.status(201).json({
      message: 'Invitation sent.',
      invitation: {
        id: Number(result.rows[0].id),
        status: result.rows[0].status,
        teamId: id,
        recipientId,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ code: 'DUPLICATE_INVITATION', message: 'A pending invitation already exists for this player and team.' });
    }
    return next(error);
  }
}

router.get('/', async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const where = ['TRUE'];
    const values = [];
    const add = (clause, value) => {
      values.push(value);
      where.push(clause.replace('?', `$${values.length}`));
    };
    if (req.query.search) add(`LOWER(t.name) LIKE ?`, `%${String(req.query.search).trim().toLowerCase().slice(0, 64)}%`);
    if (req.query.region && REGIONS.includes(req.query.region)) add(`t.region = ?`, req.query.region);
    if (req.query.role && ROLES.includes(req.query.role)) add(`? = ANY(t.open_roles)`, req.query.role);
    if (req.query.recruiting === 'true') where.push('t.recruiting = TRUE');
    const rankMin = cleanRank(req.query.rankMin);
    const rankMax = cleanRank(req.query.rankMax);
    if (rankMin !== undefined && rankMin !== null) add(`COALESCE(t.rank_max, 35000) >= ?`, rankMin);
    if (rankMax !== undefined && rankMax !== null) add(`COALESCE(t.rank_min, 0) <= ?`, rankMax);
    if (req.query.size) {
      const size = Math.max(1, Math.min(5, Number(req.query.size) || 1));
      add(`cardinality(t.members) + 1 = ?`, size);
    }

    const countResult = await db.query(`SELECT COUNT(*)::int AS count FROM teams t WHERE ${where.join(' AND ')}`, values);
    values.push(limit, offset);
    const result = await db.query(
      `SELECT t.*, owner.username AS owner_name, cardinality(t.members) + 1 AS member_count
       FROM teams t JOIN users owner ON owner.steam_id = t.owner_id
       WHERE ${where.join(' AND ')}
       ORDER BY t.recruiting DESC, t.updated_at DESC
       LIMIT $${values.length - 1} OFFSET $${values.length}`,
      values
    );
    const total = Number(countResult.rows[0]?.count || 0);
    return res.json({ teams: result.rows.map(toTeam), pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) } });
  } catch (error) {
    return next(error);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT t.*, owner.username AS owner_name, cardinality(t.members) + 1 AS member_count
       FROM teams t JOIN users owner ON owner.steam_id = t.owner_id
       WHERE t.owner_id = $1 OR $1 = ANY(t.members) ORDER BY t.updated_at DESC`,
      [req.user.steamId]
    );
    return res.json({ teams: result.rows.map(toTeam) });
  } catch (error) {
    return next(error);
  }
});

router.post('/', (req, res, next) => createTeam(req, res, next, req.user.steamId));
router.post('/:steamId/create-team', (req, res, next) => createTeam(req, res, next, String(req.params.steamId)));

router.get('/:teamId', async (req, res, next) => {
  try {
    const id = teamId(req.params.teamId);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team identifier.' });
    const result = await db.query(
      `SELECT t.*, owner.username AS owner_name, cardinality(t.members) + 1 AS member_count
       FROM teams t JOIN users owner ON owner.steam_id = t.owner_id WHERE t.id = $1`,
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found.' });
    const team = toTeam(result.rows[0]);
    const memberIds = [team.ownerId, ...team.memberIds];
    const membersResult = await db.query('SELECT * FROM users WHERE steam_id = ANY($1::text[])', [memberIds]);
    const membersById = new Map(membersResult.rows.map((row) => [String(row.steam_id), toPlayer(row)]));
    return res.json({
      ...team,
      owner: membersById.get(team.ownerId),
      members: memberIds.map((memberId) => membersById.get(memberId)).filter(Boolean),
      viewerRole: req.user.steamId === team.ownerId ? 'owner' : team.memberIds.includes(req.user.steamId) ? 'member' : 'visitor',
    });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:teamId', async (req, res, next) => {
  try {
    const id = teamId(req.params.teamId);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team identifier.' });
    const parsed = cleanTeamInput(req.body, { partial: true });
    if (parsed.error) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error });
    const entries = Object.entries(parsed.values);
    const values = entries.map(([, value]) => value);
    const assignments = entries.map(([key], index) => `${key} = $${index + 1}`);
    values.push(id, req.user.steamId);
    const result = await db.query(
      `UPDATE teams SET ${assignments.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length - 1} AND owner_id = $${values.length} RETURNING *`,
      values
    );
    if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found or you are not its owner.' });
    return res.json({ message: 'Team updated.', team: toTeam(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ code: 'TEAM_NAME_EXISTS', message: 'You already own a team with that name.' });
    return next(error);
  }
});

router.post('/:teamId/invitations', (req, res, next) => {
  const id = teamId(req.params.teamId);
  if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team identifier.' });
  return sendInvitation(req, res, next, id);
});

router.delete('/:teamId/members/:memberId', async (req, res, next) => {
  try {
    const id = teamId(req.params.teamId);
    const memberId = normalizeSteamId(req.params.memberId);
    if (!id || !memberId) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team or player identifier.' });
    const team = await getOwnedTeam(id, req.user.steamId);
    if (!team) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found or you are not its owner.' });
    if (!(team.members || []).map(String).includes(memberId)) {
      return res.status(404).json({ code: 'MEMBER_NOT_FOUND', message: 'Player is not a member of this team.' });
    }
    const result = await db.query(
      `UPDATE teams SET members = array_remove(members, $1), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [memberId, id]
    );
    return res.json({ message: 'Player removed from team.', team: toTeam(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.post('/:teamId/leave', async (req, res, next) => {
  try {
    const id = teamId(req.params.teamId);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team identifier.' });
    const result = await db.query(
      `UPDATE teams SET members = array_remove(members, $1), updated_at = NOW()
       WHERE id = $2 AND owner_id <> $1 AND $1 = ANY(members) RETURNING *`,
      [req.user.steamId, id]
    );
    if (!result.rows.length) return res.status(409).json({ code: 'CANNOT_LEAVE', message: 'You are not a member, or must transfer ownership first.' });
    return res.json({ message: 'You left the team.' });
  } catch (error) {
    return next(error);
  }
});

router.patch('/:teamId/owner', async (req, res, next) => {
  const client = await db.connect();
  try {
    const id = teamId(req.params.teamId);
    const newOwnerId = normalizeSteamId(req.body.ownerId);
    if (!id || !newOwnerId) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team or owner identifier.' });
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM teams WHERE id = $1 AND owner_id = $2 FOR UPDATE', [id, req.user.steamId]);
    const team = result.rows[0];
    if (!team) {
      await client.query('ROLLBACK');
      return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found or you are not its owner.' });
    }
    if (!(team.members || []).map(String).includes(newOwnerId)) {
      await client.query('ROLLBACK');
      return res.status(400).json({ code: 'NOT_A_MEMBER', message: 'Ownership can only be transferred to a current member.' });
    }
    const nextMembers = (team.members || []).map(String).filter((idValue) => idValue !== newOwnerId);
    nextMembers.push(req.user.steamId);
    await client.query('UPDATE teams SET owner_id = $1, members = $2, updated_at = NOW() WHERE id = $3', [newOwnerId, nextMembers, id]);
    await client.query('COMMIT');
    return res.json({ message: 'Team ownership transferred.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

router.delete('/:teamId', async (req, res, next) => {
  try {
    const id = teamId(req.params.teamId);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team identifier.' });
    const result = await db.query('DELETE FROM teams WHERE id = $1 AND owner_id = $2 RETURNING id', [id, req.user.steamId]);
    if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found or you are not its owner.' });
    return res.json({ message: 'Team deleted.' });
  } catch (error) {
    return next(error);
  }
});

// Compatibility aliases for the original frontend. They retain the old URLs but now enforce ownership.
router.post('/:steamId/:teamName/add-teammate', async (req, res, next) => {
  if (String(req.params.steamId) !== req.user.steamId) return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only manage your own teams.' });
  const result = await db.query('SELECT id FROM teams WHERE owner_id = $1 AND name = $2', [req.user.steamId, req.params.teamName]);
  if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found.' });
  return sendInvitation(req, res, next, Number(result.rows[0].id));
});

router.post('/:steamId/:teamName/remove-teammate', async (req, res, next) => {
  try {
    const memberId = normalizeSteamId(req.body.teammateId);
    if (String(req.params.steamId) !== req.user.steamId) return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only manage your own teams.' });
    if (!memberId) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid player identifier.' });
    const result = await db.query(
      `UPDATE teams SET members = array_remove(members, $1), updated_at = NOW()
       WHERE owner_id = $2 AND name = $3 AND $1 = ANY(members) RETURNING *`,
      [memberId, req.user.steamId, req.params.teamName]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'MEMBER_NOT_FOUND', message: 'Team or member not found.' });
    return res.json({ message: 'Player removed from team.', team: toTeam(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

router.post('/:steamId/:teamIndex/rename', async (req, res, next) => {
  try {
    if (String(req.params.steamId) !== req.user.steamId) return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only manage your own teams.' });
    const index = Number(req.params.teamIndex);
    const parsed = cleanTeamInput({ name: req.body.newName }, { partial: true });
    if (!Number.isInteger(index) || index < 0 || parsed.error) return res.status(400).json({ code: 'VALIDATION_ERROR', message: parsed.error || 'Invalid team index.' });
    const result = await db.query(
      `UPDATE teams SET name = $1, updated_at = NOW()
       WHERE id = (SELECT id FROM teams WHERE owner_id = $2 ORDER BY created_at OFFSET $3 LIMIT 1)
         AND owner_id = $2 RETURNING *`,
      [parsed.values.name, req.user.steamId, index]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found.' });
    return res.json({ message: 'Team renamed.', team: toTeam(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ code: 'TEAM_NAME_EXISTS', message: 'You already own a team with that name.' });
    return next(error);
  }
});

router.delete('/:steamId/:teamIndex', async (req, res, next) => {
  try {
    if (String(req.params.steamId) !== req.user.steamId) return res.status(403).json({ code: 'FORBIDDEN', message: 'You can only manage your own teams.' });
    const index = Number(req.params.teamIndex);
    if (!Number.isInteger(index) || index < 0) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid team index.' });
    const result = await db.query(
      `DELETE FROM teams
       WHERE id = (SELECT id FROM teams WHERE owner_id = $1 ORDER BY created_at OFFSET $2 LIMIT 1)
         AND owner_id = $1 RETURNING id`,
      [req.user.steamId, index]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'TEAM_NOT_FOUND', message: 'Team not found.' });
    return res.json({ message: 'Team deleted.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
