const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('🚀 Reached /auth/steam route');
  next();
}, passport.authenticate('steam'));

// Steam callback route
router.get('/return', passport.authenticate('steam', {
  failureRedirect: '/login',
}), (req, res, next) => {
  console.log('✅ Logged in successfully, user:', req.user);

  // Ensure session is saved BEFORE redirecting
  req.session.save((err) => {
    if (err) {
      console.error('❌ Error saving session:', err);
      return next(err);
    }

    console.log('✅ Session saved, redirecting to frontend');
    res.redirect('https://cs2squad-frontend.onrender.com/profile');
  });
});

module.exports = router;
