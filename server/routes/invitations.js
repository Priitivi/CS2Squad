const express = require('express');
const db = require('../data/db');
const { requireAuth } = require('../middleware/auth');
const { toInvitation } = require('../utils/mappers');

const router = express.Router();
router.use(requireAuth);

function invitationId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const INVITATION_SELECT = `
  SELECT i.*, t.name AS team_name, t.emblem,
    sender.username AS sender_name, sender.avatar AS sender_avatar,
    recipient.username AS recipient_name, recipient.avatar AS recipient_avatar
  FROM team_invitations i
  JOIN teams t ON t.id = i.team_id
  JOIN users sender ON sender.steam_id = i.sender_id
  JOIN users recipient ON recipient.steam_id = i.recipient_id`;

router.get('/', async (req, res, next) => {
  try {
    const scope = ['received', 'sent', 'all'].includes(req.query.scope) ? req.query.scope : 'received';
    const status = ['pending', 'accepted', 'declined', 'cancelled', 'all'].includes(req.query.status) ? req.query.status : 'all';
    const values = [req.user.steamId];
    const where = [];
    if (scope === 'received') where.push('i.recipient_id = $1');
    else if (scope === 'sent') where.push('i.sender_id = $1');
    else where.push('(i.recipient_id = $1 OR i.sender_id = $1)');
    if (status !== 'all') {
      values.push(status);
      where.push(`i.status = $${values.length}`);
    }
    const result = await db.query(`${INVITATION_SELECT} WHERE ${where.join(' AND ')} ORDER BY i.created_at DESC LIMIT 100`, values);
    return res.json({ invitations: result.rows.map(toInvitation) });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/accept', async (req, res, next) => {
  const id = invitationId(req.params.id);
  if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid invitation identifier.' });
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const invitationResult = await client.query(
      `SELECT i.*, t.owner_id, t.members, t.recruiting
       FROM team_invitations i JOIN teams t ON t.id = i.team_id
       WHERE i.id = $1 FOR UPDATE OF i, t`,
      [id]
    );
    const invitation = invitationResult.rows[0];
    if (!invitation || String(invitation.recipient_id) !== req.user.steamId) {
      await client.query('ROLLBACK');
      return res.status(404).json({ code: 'INVITATION_NOT_FOUND', message: 'Invitation not found.' });
    }
    if (invitation.status !== 'pending') {
      await client.query('ROLLBACK');
      return res.status(409).json({ code: 'INVITATION_RESOLVED', message: `This invitation is already ${invitation.status}.` });
    }
    const members = (invitation.members || []).map(String);
    if (String(invitation.owner_id) === req.user.steamId || members.includes(req.user.steamId)) {
      await client.query('UPDATE team_invitations SET status = $1, updated_at = NOW() WHERE id = $2', ['accepted', id]);
      await client.query('COMMIT');
      return res.json({ message: 'You are already a member of this team.' });
    }
    if (members.length >= 4) {
      await client.query('ROLLBACK');
      return res.status(409).json({ code: 'TEAM_FULL', message: 'This team is already full.' });
    }
    await client.query("UPDATE teams SET members = array_append(COALESCE(members, '{}'), $1), updated_at = NOW() WHERE id = $2", [req.user.steamId, invitation.team_id]);
    await client.query('UPDATE team_invitations SET status = $1, updated_at = NOW() WHERE id = $2', ['accepted', id]);
    await client.query(
      `UPDATE team_invitations SET status = 'cancelled', updated_at = NOW()
       WHERE recipient_id = $1 AND status = 'pending' AND id <> $2 AND team_id = $3`,
      [req.user.steamId, id, invitation.team_id]
    );
    await client.query('COMMIT');
    return res.json({ message: 'Invitation accepted. Welcome to the squad.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

router.post('/:id/decline', async (req, res, next) => {
  try {
    const id = invitationId(req.params.id);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid invitation identifier.' });
    const result = await db.query(
      `UPDATE team_invitations SET status = 'declined', updated_at = NOW()
       WHERE id = $1 AND recipient_id = $2 AND status = 'pending' RETURNING id`,
      [id, req.user.steamId]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'INVITATION_NOT_FOUND', message: 'Pending invitation not found.' });
    return res.json({ message: 'Invitation declined.' });
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/cancel', async (req, res, next) => {
  try {
    const id = invitationId(req.params.id);
    if (!id) return res.status(400).json({ code: 'INVALID_ID', message: 'Invalid invitation identifier.' });
    const result = await db.query(
      `UPDATE team_invitations SET status = 'cancelled', updated_at = NOW()
       WHERE id = $1 AND sender_id = $2 AND status = 'pending' RETURNING id`,
      [id, req.user.steamId]
    );
    if (!result.rows.length) return res.status(404).json({ code: 'INVITATION_NOT_FOUND', message: 'Pending invitation not found.' });
    return res.json({ message: 'Invitation cancelled.' });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
