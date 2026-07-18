import { useEffect, useState } from 'react';
import { PlayerCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { InviteDialog } from '../components/InviteDialog';
import { Button, Field, Input, PageHeader, PaginationNav, Select, SkeletonGrid, StateView } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { AVAILABILITY, LANGUAGES, REGIONS, ROLES } from '../lib/constants';
import type { Pagination, Player } from '../types';

const initialFilters = { search: '', region: '', role: '', language: '', availability: '', rankMin: '', rankMax: '', recruiting: true, page: 1 };

export default function FindPlayers() {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [players, setPlayers] = useState<Player[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<Player | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError('');
    const timer = window.setTimeout(() => api.players({ ...filters, limit: 12 }, controller.signal)
      .then((data) => { setPlayers(data.players); setPagination(data.pagination); })
      .catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); })
      .finally(() => setLoading(false)), 260);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters]);

  const update = (key: keyof typeof filters, value: string | boolean | number) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? Number(value) : 1 }));
  const activeCount = [filters.region, filters.role, filters.language, filters.availability, filters.rankMin, filters.rankMax].filter(Boolean).length + (filters.recruiting ? 1 : 0);
  return <div className="page section-shell discovery-page">
    <PageHeader eyebrow="Network / Players" title="Find players who fit the system." description="Filter for dependable overlap, then open the dossier before sending a team invitation." actions={<Button tone="secondary" icon="filter" className="filter-toggle" onClick={() => setShowFilters((value) => !value)}>Filters · {activeCount}</Button>}/>
    <div className="search-command"><Icon name="search"/><Input aria-label="Search players" placeholder="Search callsign…" value={filters.search} onChange={(event) => update('search', event.target.value)}/><span><strong>{pagination.total}</strong> signals found</span></div>
    <div className="discovery-layout">
      <aside className={`filter-panel ${showFilters ? 'is-open' : ''}`}><div className="filter-panel__heading"><div><div className="eyebrow">Search parameters</div><h2>Compatibility filters</h2></div><button className="icon-button filter-close" onClick={() => setShowFilters(false)} aria-label="Close filters"><Icon name="close"/></button></div><Field label="Region"><Select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">Any region</option>{REGIONS.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Preferred role"><Select value={filters.role} onChange={(event) => update('role', event.target.value)}><option value="">Any role</option>{ROLES.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Main language"><Select value={filters.language} onChange={(event) => update('language', event.target.value)}><option value="">Any language</option>{LANGUAGES.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Availability"><Select value={filters.availability} onChange={(event) => update('availability', event.target.value)}><option value="">Any schedule</option>{AVAILABILITY.map((item) => <option key={item}>{item}</option>)}</Select></Field><div className="field-row"><Field label="Min rating"><Input type="number" min="0" max="35000" placeholder="0" value={filters.rankMin} onChange={(event) => update('rankMin', event.target.value)}/></Field><Field label="Max rating"><Input type="number" min="0" max="35000" placeholder="35k" value={filters.rankMax} onChange={(event) => update('rankMax', event.target.value)}/></Field></div><label className="toggle-row"><input type="checkbox" checked={filters.recruiting} onChange={(event) => update('recruiting', event.target.checked)}/><span/><div><strong>Open to invitations</strong><small>Hide players not recruiting</small></div></label><Button tone="ghost" icon="close" onClick={() => setFilters(initialFilters)}>Reset filters</Button></aside>
      <section className="results-panel" aria-live="polite">{error ? <StateView tone="error" icon="radar" title="Player scan failed" message={error} action={<Button onClick={() => setFilters((value) => ({ ...value }))}>Retry scan</Button>}/> : loading ? <SkeletonGrid/> : players.length ? <><div className="card-grid">{players.map((player) => <PlayerCard key={player.steamId} player={player} ownProfile={player.steamId === user?.steamId} onInvite={user?.ownedTeams.length ? setInviteTarget : undefined}/>)}</div><PaginationNav page={pagination.page} pages={pagination.pages} onChange={(page) => update('page', page)}/></> : <StateView icon="players" title="No players on these coordinates" message="Remove a filter or widen the Premier window to continue the scan." action={<Button tone="secondary" onClick={() => setFilters(initialFilters)}>Clear parameters</Button>}/>}</section>
    </div>
    <InviteDialog player={inviteTarget} teams={user?.ownedTeams || []} onClose={() => setInviteTarget(null)}/>
  </div>;
}
