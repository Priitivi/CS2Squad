const passportSteam = require('passport-steam');
const db = require('./data/db');

module.exports = function configurePassport(passport) {
  if (process.env.NODE_ENV !== 'test') {
    passport.use(
      new passportSteam.Strategy(
        {
          returnURL: process.env.STEAM_RETURN_URL,
          realm: process.env.STEAM_REALM,
          apiKey: process.env.STEAM_API_KEY,
        },
        async (_identifier, profile, done) => {
          try {
            const steamId = String(profile.id);
            const username = profile.displayName;
            const avatar = profile._json.avatarfull;
            const result = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);

            if (result.rows.length) {
              const updated = await db.query(
                `UPDATE users SET username = $1, avatar = $2, updated_at = NOW()
                 WHERE steam_id = $3 RETURNING *`,
                [username, avatar, steamId]
              );
              return done(null, updated.rows[0]);
            }

            await db.query(
              `INSERT INTO users (steam_id, username, avatar)
               VALUES ($1, $2, $3)`,
              [steamId, username, avatar]
            );

            // Fetch newly created users
            const inserted = await db.query('SELECT * FROM users WHERE steam_id = $1', [steamId]);
            return done(null, inserted.rows[0]);
          } catch (error) {
            console.error('Steam login failed:', error.message);
            return done(error);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));
};
