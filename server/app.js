// server/app.js
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
const db = require('./data/db'); // Database connection

module.exports = function (passport) {

  // ✅ Only register Steam strategy outside of test environment
  if (process.env.NODE_ENV !== 'test') {
    passport.use(
      new SteamStrategy(
        {
          returnURL: process.env.STEAM_RETURN_URL,
          realm: process.env.STEAM_REALM,
          apiKey: process.env.STEAM_API_KEY,
        },
        async (identifier, profile, done) => {
          try {
            const steamId = profile.id;
            const username = profile.displayName;
            const avatar = profile._json.avatarfull;

            // Try to find the user first
            const result = await db.query(
              'SELECT * FROM users WHERE steam_id = $1',
              [steamId]
            );

            if (result.rows.length > 0) {
              console.log('✅ Found existing user in Postgres:', result.rows[0]);
              return done(null, result.rows[0]);
            }

            // Insert new user
            await db.query(
              `
              INSERT INTO users (steam_id, username, avatar)
              VALUES ($1, $2, $3)
              `,
              [steamId, username, avatar]
            );

            console.log('✅ New user inserted into Postgres:', {
              steamId,
              username,
            });

            // Fetch newly created user
            const inserted = await db.query(
              'SELECT * FROM users WHERE steam_id = $1',
              [steamId]
            );

            return done(null, inserted.rows[0]);
          } catch (err) {
            console.error('❌ Error during Steam login:', err);
            return done(err);
          }
        }
      )
    );
  }

  // Serialize / deserialize (still needed in all envs)
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
