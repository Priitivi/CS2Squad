import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TeamEmblem } from '../components/Brand';
import { Icon } from '../components/Icon';
import { ActionLink, Avatar, Badge, Button, Dialog, PageHeader, Panel, StateView, buttonClass } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { formatRank } from '../lib/utils';
import type { TeamDetail } from '../types';

export default function TeamProfile() {
  const { teamId } = useParams();
  const { refresh } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [leaveOpen, setLeaveOpen] = useState(false);
  const id = Number(teamId);
  const load = useCallback(() => { if (!id) { setError('Invalid team identifier.'); setLoading(false); return; } const controller = new AbortController(); setLoading(true); api.team(id, controller.signal).then(setTeam).catch((reason: Error) => setError(reason.message)).finally(() => setLoading(false)); return () => controller.abort(); }, [id]);
  useEffect(() => load(), [load]);
  const leave = async () => { try { const result = await api.leaveTeam(id); notify(result.message); await refresh(); navigate('/teams'); } catch (reason) { notify(reason instanceof ApiError ? reason.message : 'Could not leave team.', 'error'); } };
  if (loading) return <div className="route-loading route-loading--page"><span/><p>Loading team room</p></div>;
  if (error || !team) return <div className="page section-shell standalone-state"><StateView tone="error" icon="team" title="Team room unavailable" message={error || 'This team could not be found.'} action={<ActionLink to="/teams" tone="secondary">Return to team network</ActionLink>}/></div>;
  const openPositions = Math.max(0, 5 - team.memberCount);
  return <div className="page section-shell team-profile"><PageHeader eyebrow={`Team room / ${String(team.id).padStart(4, '0')}`} title={team.name} description={team.recruiting ? `${openPositions} roster position${openPositions === 1 ? '' : 's'} open.` : 'This team is not actively recruiting.'} actions={<>{team.viewerRole === 'owner' && <ActionLink to={`/teams/${team.id}/manage`} icon="gear">Manage team</ActionLink>}{team.viewerRole === 'member' && <Button tone="danger" icon="logout" onClick={() => setLeaveOpen(true)}>Leave team</Button>}<a className={buttonClass('secondary')} href="#roster"><Icon name="players"/><span>View roster</span></a></>}/><section className="team-hero panel"><div className="team-hero__identity"><TeamEmblem variant={team.emblem} size={92}/><div><div className="eyebrow">{team.region || 'Global'} operation</div><h2>{team.name}</h2><div className="badge-row"><Badge tone={team.recruiting ? 'success' : 'neutral'} dot>{team.recruiting ? 'Recruiting' : 'Closed'}</Badge>{team.openRoles.map((role) => <Badge tone="gold" key={role}>{role} needed</Badge>)}</div></div></div><div className="team-hero__readout"><div><small>Line-up</small><strong>{team.memberCount}<span>/5</span></strong></div><div><small>Rank target</small><strong>{formatRank(team.rankMin)}–{formatRank(team.rankMax)}</strong></div><div><small>Captain</small><strong>{team.ownerName}</strong></div></div></section><div className="team-profile__grid"><Panel><div className="panel-heading"><div><div className="eyebrow">Team briefing</div><h2>Operating intent</h2></div><Icon name="shield"/></div><p className="profile-bio">{team.description || 'The captain has not filed a team briefing yet.'}</p><dl className="detail-list"><div><dt>Primary region</dt><dd>{team.region || 'Global'}</dd></div><div><dt>Recruitment</dt><dd>{team.recruiting ? 'Open' : 'Closed'}</dd></div><div><dt>Open positions</dt><dd>{openPositions}</dd></div></dl></Panel><Panel><div className="panel-heading"><div><div className="eyebrow">Role request</div><h2>Open positions</h2></div><Icon name="crosshair"/></div>{team.openRoles.length ? <div className="role-stack">{team.openRoles.map((role, index) => <div key={role}><span>0{index + 1}</span><strong>{role}</strong></div>)}</div> : <p className="panel-empty">No specific roles are listed.</p>}</Panel></div><section className="dashboard-section" id="roster"><div className="section-heading compact"><div><div className="eyebrow">Confirmed line-up</div><h2>Roster manifest</h2></div><Badge>{team.memberCount} / 5</Badge></div><div className="roster-grid">{team.members.map((member) => <article className="panel roster-card" key={member.steamId}><Avatar src={member.avatar} name={member.username} size="lg" status={member.recruitmentStatus}/><div><strong>{member.username}</strong><span>{member.steamId === team.ownerId ? 'Captain / Owner' : member.roles[0] || 'Team member'}</span></div><ActionLink to={`/players/${member.steamId}`} tone="ghost" size="sm">Dossier</ActionLink></article>)}{Array.from({ length: openPositions }, (_, index) => <article className="panel roster-card roster-card--open" key={index}><span><Icon name="plus"/></span><div><strong>Open position</strong><small>{team.openRoles[index] || 'Flexible role'}</small></div></article>)}</div></section><Dialog open={leaveOpen} title={`Leave ${team.name}?`} description="You will lose access to this team room. The captain can invite you again later." onClose={() => setLeaveOpen(false)} danger><div className="dialog__actions"><Button tone="ghost" onClick={() => setLeaveOpen(false)}>Stay</Button><Button tone="danger" onClick={leave}>Leave team</Button></div></Dialog></div>;
}
