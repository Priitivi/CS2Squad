const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('🚀 Reached /auth/steam route');
  next();
}, passport.authenticate('steam'));

// Steam callback route
router.get('/return', passport.authenticate('steam', {
  failureRedirect: '/login',
  session: false,  // ✅ Add this to disable session handling
}), (req, res) => {
  console.log('✅ Logged in successfully, user:', req.user);

  // ✅ Generate JWT
  const token = jwt.sign(
    { steamId: req.user.steam_id, username: req.user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  // ✅ Redirect to frontend with token
  res.redirect(`https://cs2squad.com/auth-success?token=${token}`);
});

module.exports = router;
