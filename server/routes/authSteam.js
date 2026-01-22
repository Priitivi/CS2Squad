// server/routes/authSteam.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get(
  '/',
  (req, res, next) => {
    console.log('🚀 Reached /auth/steam route');
    next();
  },
  passport.authenticate('steam', {
    session: false,
  })
);

// Steam callback route
router.get(
  '/return',
  passport.authenticate('steam', {
    failureRedirect: `${FRONTEND_URL}/login?error=steam_auth_failed`,
    session: false, // ✅ ensure no sessions
  }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        console.error('❌ Missing JWT_SECRET in environment');
        return res.redirect(`${FRONTEND_URL}/login?error=server_misconfigured`);
      }

      console.log('✅ Logged in successfully, user:', req.user);

      // ✅ Generate JWT
      const token = jwt.sign(
        {
          steamId: req.user.steam_id,
          username: req.user.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // ✅ Redirect to frontend with token (encoded)
      return res.redirect(
        `${FRONTEND_URL}/auth-success?token=${encodeURIComponent(token)}`
      );
    } catch (err) {
      console.error('❌ Error generating JWT / redirecting:', err);
      return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;
