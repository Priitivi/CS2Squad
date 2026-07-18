const express = require('express');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./data/db');
const { requireAuth } = require('./middleware/auth');
const { toPlayer, toTeam } = require('./utils/mappers');

const app = express();
const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set([
  'https://cs2squad.com',
  'https://www.cs2squad.com',
  'http://localhost:5173',
  ...configuredOrigins,
]);

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '32kb' }));
app.use(express.urlencoded({ extended: true, limit: '32kb' }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    const error = new Error('Origin is not allowed by CORS policy.');
    error.status = 403;
    return callback(error);
  },
  credentials: true,
}));

require('./app')(passport);
app.use(passport.initialize());

app.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'cs2squad-api',
    message: 'CS2Squad API is operational.',
    endpoints: { health: '/health', stats: '/stats', authSteam: '/auth/steam' },
  });
});

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.get('/stats', async (_req, res, next) => {
  try {
    const { rows } = await db.query(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE profile_visibility <> 'private') AS players,
        (SELECT COUNT(*)::int FROM teams) AS teams,
        (SELECT COUNT(*)::int FROM teams WHERE recruiting = TRUE) AS recruiting_teams
    `);
    return res.json({
      players: Number(rows[0]?.players || 0),
      teams: Number(rows[0]?.teams || 0),
      recruitingTeams: Number(rows[0]?.recruiting_teams || 0),
    });
  } catch (error) {
    return next(error);
  }
});

app.use('/auth/steam', require('./routes/authSteam'));
app.use('/users', require('./routes/users'));
app.use('/team', require('./routes/team'));
app.use('/invitations', require('./routes/invitations'));

app.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userResult = await db.query('SELECT * FROM users WHERE steam_id = $1', [req.user.steamId]);
    if (!userResult.rows.length) {
      return res.status(404).json({ code: 'PROFILE_NOT_FOUND', message: 'Player profile not found.' });
    }

    const teamResult = await db.query(
      `SELECT t.*, owner.username AS owner_name, cardinality(t.members) + 1 AS member_count
       FROM teams t
       JOIN users owner ON owner.steam_id = t.owner_id
       WHERE t.owner_id = $1 OR $1 = ANY(t.members)
       ORDER BY t.created_at DESC`,
      [req.user.steamId]
    );
    const invitationResult = await db.query(
      `SELECT COUNT(*)::int AS count FROM team_invitations
       WHERE recipient_id = $1 AND status = 'pending'`,
      [req.user.steamId]
    );

    const player = toPlayer(userResult.rows[0]);
    const teams = teamResult.rows.map(toTeam);
    return res.json({
      ...player,
      teams,
      ownedTeams: teams.filter((team) => team.ownerId === req.user.steamId),
      currentTeam: teams[0] || null,
      pendingInvitationCount: Number(invitationResult.rows[0]?.count || 0),
    });
  } catch (error) {
    return next(error);
  }
});

app.use((req, res) => res.status(404).json({
  code: 'NOT_FOUND',
  message: `No API route matches ${req.method} ${req.path}.`,
}));

app.use((error, _req, res, _next) => {
  const status = Number(error.status) || 500;
  if (status >= 500) console.error('Unhandled API error:', error);
  return res.status(status).json({
    code: status >= 500 ? 'SERVER_ERROR' : 'REQUEST_ERROR',
    message: status >= 500 ? 'Something went wrong on our side.' : error.message,
  });
});

module.exports = app;
