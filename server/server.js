const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const db = require('./data/db'); // ✅ PostgreSQL connection

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS config for frontend
app.use(cors({
  origin: ['https://cs2squad-frontend.onrender.com'],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,        // must be true on HTTPS
    sameSite: 'none',    // allow cross-site cookies
  },
}));

require('./app')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ✅ Debug session route
app.get('/debug-session', (req, res) => {
  console.log('🕵️‍♂️ Debug session hit');
  res.json({
    isAuthenticated: req.isAuthenticated(),
    user: req.user || null,
    session: req.session || null,
  });
});

// ✅ Test database connection
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ✅ Root route
app.get('/', (req, res) => {
  if (req.user) {
    res.send(`Welcome back, ${req.user.username}!`);
  } else {
    res.send('CS2Squad Backend API');
  }
});

// ✅ Fetch full profile
app.get('/profile', async (req, res) => {
  if (!req.user) {
    console.log('🔒 Not authenticated for profile page');
    return res.status(401).json({ message: "Not authenticated" });
  }

  try {
    const steamId = req.user.steam_id;
    if (!steamId) return res.status(400).json({ message: "Steam ID missing" });

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
    if (allTeammateIds.size > 0) {
      const teammateRes = await db.query(
        'SELECT steam_id, username, avatar FROM users WHERE steam_id = ANY($1)',
        [Array.from(allTeammateIds)]
      );
      teammates = teammateRes.rows;
    }

    const teams = teamRes.rows.map((team, index) => ({
      name: team.name,
      members: (team.members || []).map(id => {
        const match = teammates.find(t => t.steam_id === id);
        return match
          ? {
              steamId: match.steam_id,
              username: match.username,
              avatar: match.avatar,
            }
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

// ✅ Routes
app.use('/auth/steam', require('./routes/authSteam'));
app.use('/users', require('./routes/users'));
app.use('/team', require('./routes/team'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
