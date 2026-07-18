const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

const router = express.Router();
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

router.get('/', passport.authenticate('steam', { session: false }));

router.get(
  '/return',
  passport.authenticate('steam', {
    failureRedirect: `${FRONTEND_URL}/login?error=steam_auth_failed`,
    session: false,
  }),
  (req, res) => {
    try {
      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing.');
        return res.redirect(`${FRONTEND_URL}/login?error=server_misconfigured`);
      }
      const token = jwt.sign(
        { steamId: String(req.user.steam_id), username: req.user.username },
        process.env.JWT_SECRET,
        { expiresIn: '7d', issuer: 'cs2squad-api', audience: 'cs2squad-client' }
      );

      // Fragments are not sent in HTTP referrers or server access logs.
      return res.redirect(`${FRONTEND_URL}/auth-success#token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error('Steam callback failed:', error.message);
      return res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  }
);

module.exports = router;
