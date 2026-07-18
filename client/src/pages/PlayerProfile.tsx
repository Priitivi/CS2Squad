import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { InviteDialog } from '../components/InviteDialog';
import { ActionLink, Avatar, Badge, Button, PageHeader, Panel, RankBadge, SkeletonGrid, StateView, buttonClass } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../lib/api';
import type { Player } from '../types';

export default function PlayerProfile({ own = false }: { own?: boolean }) {
  const { steamId } = useParams();
  const { user } = useAuth();
  const [player, setPlayer] = useState<Player | null>(own ? user : null);
  const [loading, setLoading] = useState(!own);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const isOwn = own || player?.steamId === user?.steamId;

  useEffect(() => {
    if (own) { setPlayer(user); return; }
    if (!steamId) return;
    const controller = new AbortController(); setLoading(true); setError(null);
    api.player(steamId, controller.signal).then(setPlayer).catch((reason) => {
      if ((reason as Error).name !== 'AbortError') setError({ message: reason instanceof ApiError ? reason.message : 'Profile could not be loaded.', code: reason instanceof ApiError ? reason.code : undefined });
    }).finally(() => setLoading(false));
    return () => controller.abort();
  }, [own, steamId, user]);

  if (loading) return <div className="page section-shell"><SkeletonGrid count={1}/></div>;
  if (error || !player) return <div className="page section-shell standalone-state"><StateView tone="error" icon={error?.code === 'PROFILE_PRIVATE' ? 'shield' : 'user'} title={error?.code === 'PROFILE_PRIVATE' ? 'Private player signal' : 'Player not found'} message={error?.message || 'This player profile is unavailable.'} action={<ActionLink to="/players" tone="secondary">Return to player network</ActionLink>}/></div>;

  return <div className="page section-shell profile-page">
    <PageHeader eyebrow={isOwn ? 'Your player dossier' : 'Verified player dossier'} title={player.username} description={player.recruitmentStatus ? 'Open to relevant team invitations.' : 'Not currently accepting team invitations.'} actions={<>{isOwn ? <ActionLink to="/settings" icon="gear">Edit profile</ActionLink> : user?.ownedTeams.length && player.recruitmentStatus ? <Button icon="invite" onClick={() => setInviteOpen(true)}>Invite to team</Button> : null}<a className={buttonClass('secondary')} href={player.steamProfile} target="_blank" rel="noreferrer"><Icon name="steam"/><span>Steam profile</span></a></>}/>
    <section className="profile-hero panel"><div className="profile-hero__identity"><Avatar src={player.avatar} name={player.username} size="xl" status={player.recruitmentStatus}/><div><div className="eyebrow">STEAM / {player.steamId}</div><h2>{player.username}</h2><div className="badge-row"><Badge tone={player.recruitmentStatus ? 'success' : 'neutral'} dot>{player.recruitmentStatus ? 'Recruiting' : 'Unavailable'}</Badge>{player.currentTeam ? <Badge tone="gold">{player.currentTeam.name}</Badge> : <Badge>Free agent</Badge>}</div></div></div><RankBadge rank={player.rank}/><div className="profile-hero__coords"><div><small>Region</small><strong>{player.region || 'Unset'}</strong></div><div><small>Main comms</small><strong>{player.language || 'Unset'}</strong></div><div><small>Play style</small><strong>{player.playStyle || 'Unset'}</strong></div></div></section>
    <div className="profile-content"><Panel><div className="panel-heading"><div><div className="eyebrow">Field note</div><h2>Player briefing</h2></div><Icon name="user"/></div><p className="profile-bio">{player.bio || 'No briefing has been added.'}</p><dl className="detail-list"><div><dt>Competitive goal</dt><dd>{player.goals || 'Not specified'}</dd></div><div><dt>Profile visibility</dt><dd>{player.profileVisibility}</dd></div></dl></Panel><Panel><div className="panel-heading"><div><div className="eyebrow">Loadout</div><h2>Preferred roles</h2></div><Icon name="crosshair"/></div><div className="role-stack">{player.roles.length ? player.roles.map((role, index) => <div key={role}><span>0{index + 1}</span><strong>{role}</strong></div>) : <p className="panel-empty">No roles selected.</p>}</div></Panel><Panel><div className="panel-heading"><div><div className="eyebrow">Queue windows</div><h2>Availability</h2></div><Icon name="radar"/></div><div className="availability-grid">{player.availability.length ? player.availability.map((item) => <span key={item}><i/>{item}</span>) : <p className="panel-empty">No schedule published.</p>}</div></Panel></div>
    {player.teams?.length ? <section className="dashboard-section"><div className="section-heading compact"><div><div className="eyebrow">Team history</div><h2>Current line-up</h2></div></div><div className="compact-team-row">{player.teams.map((team) => <Link to={`/teams/${team.id}`} key={team.id}><span><Icon name="team"/></span><div><strong>{team.name}</strong><small>{team.region || 'Global'} · {team.memberCount}/5 players</small></div><Icon name="chevron"/></Link>)}</div></section> : null}
    <InviteDialog player={inviteOpen ? player : null} teams={user?.ownedTeams || []} onClose={() => setInviteOpen(false)}/>
  </div>;
}
