const passportSteam = require('passport-steam');
const passport = require('passport');
const SteamStrategy = passportSteam.Strategy;

module.exports = function (passport) {
  passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
  }, (identifier, profile, done) => {
    const user = {
      id: profile.id,
      displayName: profile.displayName,
      steamProfile: profile._json.profileurl,
      avatar: profile._json.avatarfull,
    };
    console.log('🟢 User object passed to session:', user);
    return done(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
