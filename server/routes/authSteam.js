const express = require('express');
const passport = require('passport');
const router = express.Router();

// Redirect to Steam login page
router.get('/', passport.authenticate('steam'));

// Steam callback route
router.get('/return', passport.authenticate('steam', {
  failureRedirect: '/login',
}), (req, res) => {
  // Successful login, redirect to homepage (or wherever you need)
  res.redirect('/');
});

module.exports = router;
