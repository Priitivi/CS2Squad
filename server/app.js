const passportSteam = require('passport-steam');
const passport = require('passport');
const SteamStrategy = passportSteam.Strategy;
const User = require('./models/User'); // ✅ Proper User class
const { addUser } = require('./data/mockDB');

module.exports = function (passport) {
  passport.use(new SteamStrategy({
    returnURL: process.env.STEAM_RETURN_URL,
    realm: process.env.STEAM_REALM,
    apiKey: process.env.STEAM_API_KEY,
  }, (identifier, profile, done) => {
    // ✅ Instantiate the class instead of using a plain object
    const user = new User({
      steamId: profile.id,
      username: profile.displayName,
      avatar: profile._json.avatarfull,
      region: '',
      rank: '',
      roles: [],
      availability: [],
      teams: [],  // ✅ IMPORTANT
    });
    

    console.log('🟢 User object passed to session:', user);

    addUser(user);
    console.log('🟢 Stored new user:', user);

    return done(null, user);
  }));

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
