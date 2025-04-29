const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { getUser } = require('./data/realDB'); // ✅ USE realDB NOW
const db = require('./data/db'); // ✅ connection

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    sameSite: 'lax',
  },
}));

require('./app')(passport);
app.use(passport.initialize());
app.use(passport.session());

// ✅ DB Test route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ success: true, time: result.rows[0].now });
  } catch (err) {
    console.error('❌ DB connection failed:', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

app.get('/', (req, res) => {
  if (req.user) {
    res.send(`Welcome back, ${req.user.username}!`);
  } else {
    res.send('CS2Squad Backend API');
  }
});

app.get('/profile', async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  try {
    const steamId = req.user.steam_id || req.user.steamId;
    if (!steamId) return res.status(400).json({ message: "Steam ID missing from session user" });

    // Get user from DB
    const userResult = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found in DB" });
    }
    const user = userResult.rows[0];

    // Get teams from DB
    const teamResult = await db.query(
      `SELECT id, name, members, created_at FROM teams WHERE owner_id = $1 ORDER BY created_at`,
      [steamId]
    );

    const teams = teamResult.rows.map((team, idx) => ({
      id: team.id,
      name: team.name,
      members: team.members,
      createdAt: team.created_at,
      originalIndex: idx,
    }));

    // Send full user + teams
    res.json({
      steamId: user.steam_id,
      username: user.username,
      avatar: user.avatar,
      region: user.region,
      rank: user.rank,
      roles: user.roles || [],
      availability: user.availability || [],
      teams: teams,
    });
  } catch (err) {
    console.error("❌ Error fetching profile:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// Routes
const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const teamRoutes = require('./routes/team');
app.use('/team', teamRoutes);

app.use('/auth/steam', require('./routes/authSteam'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
