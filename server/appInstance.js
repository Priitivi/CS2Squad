// appInstance.js — exports app without listening
const express = require('express');
const passport = require('passport');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const db = require('./data/db');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'https://cs2squad.com',
  'https://www.cs2squad.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error(`Blocked by CORS: ${origin}`), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

require('./app')(passport);
app.use(passport.initialize());

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Invalid token' });
    req.user = decoded;
    next();
  });
}

// ✅ Mount routes
app.use('/auth/steam', require('./routes/authSteam'));
app.use('/users', require('./routes/users'));
app.use('/team', require('./routes/team'));

// ✅ Health check (used by monitoring / load balancers)
app.get('/health', async (req, res) => {
  // Basic: app is up
  res.status(200).json({ status: 'ok' });
});



app.get('/profile', verifyToken, async (req, res) => {
  try {
    const steamId = req.user.steamId;
    const userRes = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });

    const user = userRes.rows[0];
    const teamRes = await db.query(
      'SELECT id, name, members, created_at FROM teams WHERE owner_id = $1 ORDER BY created_at',
      [steamId]
    );

    const allTeammateIds = new Set();
    teamRes.rows.forEach(team => (team.members || []).forEach(id => allTeammateIds.add(id)));

    const teammates = allTeammateIds.size
      ? (await db.query(
          'SELECT steam_id, username, avatar FROM users WHERE steam_id = ANY($1)',
          [Array.from(allTeammateIds)]
        )).rows
      : [];

    const teams = teamRes.rows.map((team, index) => ({
      name: team.name,
      members: (team.members || []).map(id => {
        const match = teammates.find(t => t.steam_id === id);
        return match
          ? { steamId: match.steam_id, username: match.username, avatar: match.avatar }
          : { steamId: id };
      }),
      createdAt: team.created_at,
      originalIndex: index,
    }));

    res.json({
      steamId: user.steam_id,
      username: user.username,
      avatar: user.avatar,
      region: user.region,
      rank: user.rank,
      roles: user.roles || [],
      availability: user.availability || [],
      teams,
    });
  } catch (err) {
    console.error("❌ Error fetching profile from DB:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = app;
