const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

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
    secure: false, // true ONLY if using https
    sameSite: 'lax' // this is the KEY setting for localhost cross-origin
  }
}));


// Initialize Passport.js
require('./app')(passport);  // Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    console.log('Session:', req.session);
    console.log('User:', req.user);  // User should be populated now after login
    if (req.user) {
      res.send(`Welcome back, ${req.user.displayName}!`);
    } else {
      res.send('CS2Squad Backend API');
    }
  });

// Profile page route
app.get("/profile", (req, res) => {
  console.log("Session ID:", req.sessionID);
  console.log("Authenticated user:", req.user);

  if (req.isAuthenticated()) {
    res.json({
      username: req.user.displayName,
      steamProfile: req.user.steamProfile,
      avatar: req.user.avatar,
    });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});


  
  
// Steam authentication routes
app.use('/auth/steam', require('./routes/authSteam'));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
