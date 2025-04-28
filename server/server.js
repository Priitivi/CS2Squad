const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { getUser } = require('./data/mockDB'); // ✅ NEW

// Initialize the Express app
const app = express();
const port = process.env.PORT || 5000;

// Middleware
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
    sameSite: 'lax'
  }
}));

// Initialize Passport.js
require('./app')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
  console.log('Session:', req.session);
  console.log('User:', req.user);
  if (req.user) {
    res.send(`Welcome back, ${req.user.username}!`);
  } else {
    res.send('CS2Squad Backend API');
  }
});

// ✅ FIXED Profile Route to pull fresh data!
app.get('/profile', (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });

  const freshUser = getUser(req.user.steamId); // 🛠 always get latest user
  if (!freshUser) return res.status(404).json({ message: "User not found" });

  res.json({
    steamId: freshUser.steamId,
    username: freshUser.username,
    avatar: freshUser.avatar,
    region: freshUser.region,
    rank: freshUser.rank,
    roles: freshUser.roles,
    availability: freshUser.availability,
    teams: freshUser.teams || [],
  });
});

const userRoutes = require('./routes/users');
app.use('/users', userRoutes);

const teamRoutes = require('./routes/team');
app.use('/team', teamRoutes);

app.use('/auth/steam', require('./routes/authSteam'));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
