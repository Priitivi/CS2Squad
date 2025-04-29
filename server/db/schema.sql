DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  steam_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  region TEXT,
  rank INTEGER,
  roles TEXT[],
  availability TEXT[]
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  owner_id TEXT REFERENCES users(steam_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  members TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
