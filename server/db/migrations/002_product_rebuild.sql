BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS play_style TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS goals TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT NOT NULL DEFAULT 'public';
ALTER TABLE users ADD COLUMN IF NOT EXISTS recruitment_status BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE teams ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT '';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS rank_min INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS rank_max INTEGER;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS open_roles TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS recruiting BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS emblem TEXT NOT NULL DEFAULT 'vanguard';
ALTER TABLE teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS team_invitations (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES users(steam_id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES users(steam_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (sender_id <> recipient_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS team_invitations_pending_unique
  ON team_invitations (team_id, recipient_id)
  WHERE status = 'pending';
CREATE UNIQUE INDEX IF NOT EXISTS teams_owner_name_unique ON teams (owner_id, name);
CREATE INDEX IF NOT EXISTS users_discovery_idx ON users (profile_visibility, recruitment_status, region, rank);
CREATE INDEX IF NOT EXISTS teams_discovery_idx ON teams (recruiting, region, rank_min, rank_max);
CREATE INDEX IF NOT EXISTS team_invitations_recipient_idx ON team_invitations (recipient_id, status, created_at DESC);

COMMIT;
