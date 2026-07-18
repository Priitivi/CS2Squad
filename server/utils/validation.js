const REGIONS = ['EU', 'NA', 'SA', 'ASIA', 'OCE', 'AF', 'ME'];
const ROLES = ['IGL', 'Entry', 'AWPer', 'Support', 'Lurker', 'Rifler', 'Anchor'];
const AVAILABILITY = ['Weekday mornings', 'Weekday afternoons', 'Weekday evenings', 'Late nights', 'Weekends'];
const PLAY_STYLES = ['Structured', 'Aggressive', 'Methodical', 'Adaptive', 'Supportive'];
const GOALS = ['Competitive climb', 'Build a five-stack', 'League play', 'Improve fundamentals', 'Play socially'];
const VISIBILITY = ['public', 'members', 'private'];

function cleanString(value, maxLength, { required = false } = {}) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string') return null;
  const cleaned = value.trim().replace(/\s+/g, ' ');
  if ((required && !cleaned) || cleaned.length > maxLength) return null;
  return cleaned;
}

function cleanStringArray(value, allowed, maxItems = 5) {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > maxItems) return null;
  const normalized = [...new Set(value.map((item) => String(item).trim()))];
  return normalized.every((item) => allowed.includes(item)) ? normalized : null;
}

function cleanRank(value, { optional = true } = {}) {
  if (value === undefined && optional) return undefined;
  const rank = Number(value);
  if (!Number.isInteger(rank) || rank < 0 || rank > 35000) return null;
  return rank;
}

function normalizeSteamId(value) {
  const id = String(value || '').trim();
  return /^\d{5,20}$/.test(id) ? id : null;
}

function cleanProfileInput(body = {}) {
  const fields = {
    username: body.username === undefined ? undefined : cleanString(body.username, 48, { required: true }),
    bio: cleanString(body.bio, 400),
    region: body.region === undefined ? undefined : (REGIONS.includes(body.region) ? body.region : null),
    rank: cleanRank(body.rank),
    roles: cleanStringArray(body.roles, ROLES, 4),
    language: cleanString(body.language, 40),
    availability: cleanStringArray(body.availability, AVAILABILITY, 5),
    play_style: body.playStyle === undefined ? undefined : (PLAY_STYLES.includes(body.playStyle) ? body.playStyle : null),
    goals: body.goals === undefined ? undefined : (GOALS.includes(body.goals) ? body.goals : null),
    profile_visibility: body.profileVisibility === undefined ? undefined : (VISIBILITY.includes(body.profileVisibility) ? body.profileVisibility : null),
    recruitment_status: body.recruitmentStatus === undefined ? undefined : Boolean(body.recruitmentStatus),
  };

  const invalid = Object.entries(fields).find(([, value]) => value === null);
  if (invalid) return { error: `Invalid value for ${invalid[0]}.` };
  const values = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  if (!Object.keys(values).length) return { error: 'No supported profile fields were provided.' };
  return { values };
}

function cleanTeamInput(body = {}, { partial = false } = {}) {
  const name = body.name === undefined ? (partial ? undefined : null) : cleanString(body.name, 48, { required: true });
  const description = cleanString(body.description, 500);
  const region = body.region === undefined ? undefined : (REGIONS.includes(body.region) ? body.region : null);
  const rankMin = cleanRank(body.rankMin);
  const rankMax = cleanRank(body.rankMax);
  const openRoles = cleanStringArray(body.openRoles, ROLES, 5);
  const emblem = cleanString(body.emblem, 24);
  const recruiting = body.recruiting === undefined ? undefined : Boolean(body.recruiting);

  const fields = { name, description, region, rank_min: rankMin, rank_max: rankMax, open_roles: openRoles, emblem, recruiting };
  const invalid = Object.entries(fields).find(([, value]) => value === null);
  if (invalid) return { error: `Invalid value for ${invalid[0]}.` };

  const values = Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined));
  if (rankMin !== undefined && rankMax !== undefined && rankMin > rankMax) {
    return { error: 'Minimum rank cannot exceed maximum rank.' };
  }
  if (partial && !Object.keys(values).length) return { error: 'No supported team fields were provided.' };
  return { values };
}

function parsePagination(query = {}) {
  const page = Math.max(1, Math.min(10000, Number.parseInt(query.page, 10) || 1));
  const limit = Math.max(1, Math.min(48, Number.parseInt(query.limit, 10) || 12));
  return { page, limit, offset: (page - 1) * limit };
}

module.exports = {
  AVAILABILITY,
  GOALS,
  PLAY_STYLES,
  REGIONS,
  ROLES,
  VISIBILITY,
  cleanProfileInput,
  cleanRank,
  cleanString,
  cleanTeamInput,
  normalizeSteamId,
  parsePagination,
};
