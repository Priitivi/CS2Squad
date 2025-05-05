const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./data/db'); // ✅ PostgreSQL connection

const app = express();
const port = process.env.PORT || 5000;

// ✅ Serve static React build files
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Express JSON body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session + passport setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',  // secure only in prod
    httpOnly: true,
    sameSite: 'lax',  // no cross-domain needed anymore
  },
}));

require('./app')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ✅ API routes
app.use('/auth/steam', require('./routes/authSteam'));
app.use('/users', require('./routes/users'));
app.use('/team', require('./routes/team'));

app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  try {
    const steamId = req.user.steam_id;
    const userRes = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
    if (userRes.rows.length === 0) return res.status(404).json({ message: "User not found" });
    const user = userRes.rows[0];

    const teamRes = await db.query(
      'SELECT id, name, members, created_at FROM teams WHERE owner_id = $1 ORDER BY created_at',
      [steamId]
    );

    const allTeammateIds = new Set();
    teamRes.rows.forEach(team => {
      (team.members || []).forEach(id => allTeammateIds.add(id));
    });

    let teammates = [];
    const teammateIdsArray = Array.from(allTeammateIds);
    if (teammateIdsArray.length > 0) {
      const teammateRes = await db.query(
        'SELECT steam_id, username, avatar FROM users WHERE steam_id = ANY($1)',
        [teammateIdsArray]
      );
      teammates = teammateRes.rows;
    }

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

// ✅ Catch-all route for React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
