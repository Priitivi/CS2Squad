const passportSteam = require('passport-steam');
const passport = require('passport');
const SteamStrategy = passportSteam.Strategy;

module.exports = function(passport) {
  passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
  }, (identifier, profile, done) => {
    console.log(profile);  // This will log the profile when the user logs in
    return done(null, profile);  // Handle storing user info
  }));

  // Serialize and deserialize user for session management
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
