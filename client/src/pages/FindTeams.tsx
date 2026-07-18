import { useEffect, useState } from 'react';
import { TeamCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { ActionLink, Button, Field, Input, PageHeader, PaginationNav, Select, SkeletonGrid, StateView } from '../components/UI';
import { api } from '../lib/api';
import { REGIONS, ROLES } from '../lib/constants';
import type { Pagination, TeamSummary } from '../types';

const initialFilters = { search: '', region: '', role: '', rankMin: '', rankMax: '', size: '', recruiting: true, page: 1 };

export default function FindTeams() {
  const [filters, setFilters] = useState(initialFilters);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    const controller = new AbortController(); setLoading(true); setError('');
    const timer = window.setTimeout(() => api.teams({ ...filters, limit: 12 }, controller.signal).then((data) => { setTeams(data.teams); setPagination(data.pagination); }).catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); }).finally(() => setLoading(false)), 260);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters]);
  const update = (key: keyof typeof filters, value: string | boolean | number) => setFilters((current) => ({ ...current, [key]: value, page: key === 'page' ? Number(value) : 1 }));
  const activeCount = [filters.region, filters.role, filters.rankMin, filters.rankMax, filters.size].filter(Boolean).length + (filters.recruiting ? 1 : 0);
  return <div className="page section-shell discovery-page"><PageHeader eyebrow="Network / Teams" title="Find a line-up with a real plan." description="Read the roster, rank target, and open positions before you commit your next queue." actions={<><ActionLink to="/teams/new" icon="plus">Create team</ActionLink><Button tone="secondary" icon="filter" className="filter-toggle" onClick={() => setShowFilters((value) => !value)}>Filters · {activeCount}</Button></>}/><div className="search-command"><Icon name="search"/><Input aria-label="Search teams" placeholder="Search team name…" value={filters.search} onChange={(event) => update('search', event.target.value)}/><span><strong>{pagination.total}</strong> team rooms found</span></div><div className="discovery-layout"><aside className={`filter-panel ${showFilters ? 'is-open' : ''}`}><div className="filter-panel__heading"><div><div className="eyebrow">Search parameters</div><h2>Team filters</h2></div><button className="icon-button filter-close" onClick={() => setShowFilters(false)} aria-label="Close filters"><Icon name="close"/></button></div><Field label="Region"><Select value={filters.region} onChange={(event) => update('region', event.target.value)}><option value="">Any region</option>{REGIONS.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Open position"><Select value={filters.role} onChange={(event) => update('role', event.target.value)}><option value="">Any role</option>{ROLES.map((item) => <option key={item}>{item}</option>)}</Select></Field><Field label="Current team size"><Select value={filters.size} onChange={(event) => update('size', event.target.value)}><option value="">Any size</option>{[1, 2, 3, 4, 5].map((size) => <option value={size} key={size}>{size} / 5 players</option>)}</Select></Field><div className="field-row"><Field label="Min rating"><Input type="number" min="0" max="35000" placeholder="0" value={filters.rankMin} onChange={(event) => update('rankMin', event.target.value)}/></Field><Field label="Max rating"><Input type="number" min="0" max="35000" placeholder="35k" value={filters.rankMax} onChange={(event) => update('rankMax', event.target.value)}/></Field></div><label className="toggle-row"><input type="checkbox" checked={filters.recruiting} onChange={(event) => update('recruiting', event.target.checked)}/><span/><div><strong>Recruiting now</strong><small>Hide closed line-ups</small></div></label><Button tone="ghost" icon="close" onClick={() => setFilters(initialFilters)}>Reset filters</Button></aside><section className="results-panel" aria-live="polite">{error ? <StateView tone="error" icon="radar" title="Team scan failed" message={error} action={<Button onClick={() => setFilters((value) => ({ ...value }))}>Retry scan</Button>}/> : loading ? <SkeletonGrid/> : teams.length ? <><div className="card-grid">{teams.map((team) => <TeamCard key={team.id} team={team}/>)}</div><PaginationNav page={pagination.page} pages={pagination.pages} onChange={(page) => update('page', page)}/></> : <StateView icon="team" title="No team rooms on these coordinates" message="Clear a filter or create the line-up you want to see." action={<ActionLink to="/teams/new" icon="plus">Create team</ActionLink>}/>}</section></div></div>;
}
