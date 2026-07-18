export function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function initials(name = 'Player') {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function formatRank(rank: number | null | undefined) {
  return rank === null || rank === undefined ? 'Unrated' : rank.toLocaleString('en-GB');
}

export function rankTier(rank: number | null | undefined) {
  if (rank === null || rank === undefined) return { label: 'Unrated', tone: 'neutral' };
  if (rank < 5000) return { label: 'Field', tone: 'grey' };
  if (rank < 10000) return { label: 'Cadet', tone: 'cyan' };
  if (rank < 15000) return { label: 'Operator', tone: 'blue' };
  if (rank < 20000) return { label: 'Vanguard', tone: 'violet' };
  if (rank < 25000) return { label: 'Elite', tone: 'rose' };
  if (rank < 30000) return { label: 'Master', tone: 'red' };
  return { label: 'World', tone: 'gold' };
}

export function relativeDate(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function profileCompletion(profile: { region?: string; rank?: number | null; roles?: string[]; language?: string; bio?: string }) {
  const checks = [Boolean(profile.region), profile.rank !== null && profile.rank !== undefined, Boolean(profile.roles?.length), Boolean(profile.language), Boolean(profile.bio)];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function withQuery(path: string, params: Record<string, string | number | boolean | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
