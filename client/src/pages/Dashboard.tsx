import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlayerCard, TeamCard } from '../components/Cards';
import { Icon } from '../components/Icon';
import { ActionLink, Avatar, Badge, PageHeader, Panel, SkeletonGrid, StateView } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatRank, profileCompletion, relativeDate } from '../lib/utils';
import type { Invitation, Player, TeamSummary } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<TeamSummary[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      api.players({ recruiting: true, region: user?.region || undefined, limit: 3 }, controller.signal),
      api.teams({ recruiting: true, region: user?.region || undefined, limit: 3 }, controller.signal),
      api.invitations('received', 'pending', controller.signal),
    ]).then(([playerData, teamData, invitationData]) => {
      setPlayers(playerData.players.filter((player) => player.steamId !== user?.steamId).slice(0, 3));
      setTeams(teamData.teams.slice(0, 3));
      setInvitations(invitationData.invitations.slice(0, 3));
    }).catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [user?.region, user?.steamId]);

  if (!user) return null;
  const completion = profileCompletion(user);
  return <div className="page section-shell">
    <PageHeader eyebrow={`Command / ${user.region || 'Uncalibrated'}`} title={`Ready, ${user.username}.`} description="Your squad network is synchronized. Review the live signals and take the next useful action." actions={<ActionLink to="/players" icon="radar">Scan network</ActionLink>}/>

    {!user.profileCompleted && <div className="mission-alert"><div className="mission-alert__meter" style={{ '--progress': `${completion}%` } as React.CSSProperties}><strong>{completion}%</strong></div><div><div className="eyebrow">Profile calibration incomplete</div><h2>Give captains enough signal to pick you.</h2><p>Add your main language, role, region, and schedule to improve discovery quality.</p></div><ActionLink to="/onboarding" tone="secondary">Complete profile</ActionLink></div>}

    <section className="dashboard-grid">
      <Panel className="identity-panel"><div className="panel-heading"><div><div className="eyebrow">Player signal</div><h2>Your combat card</h2></div><Link className="text-link" to="/profile">Open profile <Icon name="arrow" size={15}/></Link></div><div className="identity-panel__body"><Avatar src={user.avatar} name={user.username} size="xl" status={user.recruitmentStatus}/><div><h3>{user.username}</h3><div className="badge-row">{user.roles.map((role) => <Badge key={role} tone="gold">{role}</Badge>)}</div><dl><div><dt>Premier</dt><dd>{formatRank(user.rank)}</dd></div><div><dt>Region</dt><dd>{user.region || 'Unset'}</dd></div><div><dt>Language</dt><dd>{user.language || 'Unset'}</dd></div></dl></div></div></Panel>
      <Panel className="team-status-panel"><div className="panel-heading"><div><div className="eyebrow">Line-up status</div><h2>{user.currentTeam ? user.currentTeam.name : 'No active team'}</h2></div><Icon name="team" size={25}/></div>{user.currentTeam ? <><div className="roster-dots">{Array.from({ length: 5 }, (_, index) => <span className={index < user.currentTeam!.memberCount ? 'is-filled' : ''} key={index}>{index + 1}</span>)}</div><p>{user.currentTeam.memberCount}/5 positions confirmed. {user.currentTeam.recruiting ? 'Recruitment channel is open.' : 'Recruitment is closed.'}</p><ActionLink to={`/teams/${user.currentTeam.id}`} tone="secondary" size="sm">Open team room</ActionLink></> : <><div className="empty-radar"><Icon name="radar" size={36}/></div><p>Create a team room or find a recruiting line-up that fits your brief.</p><div className="inline-actions"><ActionLink to="/teams/new" size="sm" icon="plus">Create team</ActionLink><ActionLink to="/teams" tone="ghost" size="sm">Browse teams</ActionLink></div></>}</Panel>
      <Panel className="inbox-panel"><div className="panel-heading"><div><div className="eyebrow">Incoming traffic</div><h2>Invitations</h2></div><Badge tone={invitations.length ? 'gold' : 'neutral'}>{invitations.length} pending</Badge></div>{invitations.length ? <div className="compact-list">{invitations.map((invite) => <Link to="/invitations" key={invite.id}><span className="compact-list__icon"><Icon name="invite"/></span><span><strong>{invite.team.name}</strong><small>From {invite.sender.username} · {relativeDate(invite.createdAt)}</small></span><Icon name="chevron" size={16}/></Link>)}</div> : <p className="panel-empty">No pending invitations. Your channel is clear.</p>}<Link className="text-link" to="/invitations">Review invitation log <Icon name="arrow" size={15}/></Link></Panel>
    </section>

    {error ? <StateView tone="error" icon="radar" title="Network scan interrupted" message={error}/> : loading ? <><section className="dashboard-section"><div className="section-heading compact"><div><div className="eyebrow">Compatibility scan</div><h2>Players near your signal</h2></div></div><SkeletonGrid count={3}/></section></> : <>
      <section className="dashboard-section"><div className="section-heading compact"><div><div className="eyebrow">Compatibility scan</div><h2>Players near your signal</h2></div><ActionLink to="/players" tone="ghost" size="sm">View all players</ActionLink></div>{players.length ? <div className="card-grid card-grid--three">{players.map((player) => <PlayerCard key={player.steamId} player={player}/>)}</div> : <StateView icon="players" title="No aligned signals yet" message="Broaden your region or complete your player brief to surface more results."/>}</section>
      <section className="dashboard-section"><div className="section-heading compact"><div><div className="eyebrow">Open team rooms</div><h2>Line-ups actively recruiting</h2></div><ActionLink to="/teams" tone="ghost" size="sm">View all teams</ActionLink></div>{teams.length ? <div className="card-grid card-grid--three">{teams.map((team) => <TeamCard key={team.id} team={team}/>)}</div> : <StateView icon="team" title="No recruiting teams in range" message="Remove region constraints or create a team room of your own."/>}</section>
    </>}
  </div>;
}
