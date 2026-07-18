DROP TABLE IF EXISTS team_invitations;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  steam_id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  avatar TEXT,
  bio TEXT NOT NULL DEFAULT '',
  region TEXT,
  rank INTEGER,
  roles TEXT[] NOT NULL DEFAULT '{}',
  language TEXT NOT NULL DEFAULT '',
  availability TEXT[] NOT NULL DEFAULT '{}',
  play_style TEXT NOT NULL DEFAULT '',
  goals TEXT NOT NULL DEFAULT '',
  profile_visibility TEXT NOT NULL DEFAULT 'public',
  recruitment_status BOOLEAN NOT NULL DEFAULT TRUE,
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_rank_range CHECK (rank IS NULL OR rank BETWEEN 0 AND 35000),
  CONSTRAINT users_visibility CHECK (profile_visibility IN ('public', 'members', 'private'))
);

CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  owner_id TEXT REFERENCES users(steam_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  rank_min INTEGER,
  rank_max INTEGER,
  open_roles TEXT[] NOT NULL DEFAULT '{}',
  recruiting BOOLEAN NOT NULL DEFAULT TRUE,
  emblem TEXT NOT NULL DEFAULT 'vanguard',
  members TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (owner_id, name),
  CONSTRAINT teams_rank_range CHECK (
    (rank_min IS NULL OR rank_min BETWEEN 0 AND 35000) AND
    (rank_max IS NULL OR rank_max BETWEEN 0 AND 35000) AND
    (rank_min IS NULL OR rank_max IS NULL OR rank_min <= rank_max)
  )
);

CREATE TABLE team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(steam_id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES users(steam_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invitation_not_self CHECK (sender_id <> recipient_id),
  CONSTRAINT invitation_status CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled'))
);

CREATE UNIQUE INDEX team_invitations_pending_unique
  ON team_invitations (team_id, recipient_id)
  WHERE status = 'pending';
CREATE INDEX users_discovery_idx ON users (profile_visibility, recruitment_status, region, rank);
CREATE INDEX teams_discovery_idx ON teams (recruiting, region, rank_min, rank_max);
CREATE INDEX team_invitations_recipient_idx ON team_invitations (recipient_id, status, created_at DESC);
