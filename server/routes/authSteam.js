const express = require('express');
const passport = require('passport');
const router = express.Router();

// Redirect to Steam login page
router.get('/', passport.authenticate('steam'));

// Steam callback route
router.get('/return', passport.authenticate('steam', {
  failureRedirect: '/login',
}), (req, res) => {
  console.log('✅ Logged in successfully, user:', req.user);
  res.redirect('http://localhost:5173/profile');
});



module.exports = router;
