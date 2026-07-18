import { Link } from 'react-router-dom';
import type { Player, TeamSummary } from '../types';
import { formatRank } from '../lib/utils';
import { TeamEmblem } from './Brand';
import { Avatar, Badge, Button, RankBadge } from './UI';
import { Icon } from './Icon';

export function PlayerCard({ player, onInvite, ownProfile = false }: { player: Player; onInvite?: (player: Player) => void; ownProfile?: boolean }) {
  return <article className="panel player-card">
    <div className="player-card__top"><Avatar src={player.avatar} name={player.username} size="lg" status={player.recruitmentStatus}/><div><div className="player-card__name"><Link to={`/players/${player.steamId}`}>{player.username}</Link>{ownProfile && <Badge tone="gold">You</Badge>}</div><div className="muted-line"><span>{player.region || 'Region unset'}</span><i/> <span>{player.language || 'Language unset'}</span></div></div></div>
    <div className="player-card__rank"><RankBadge rank={player.rank}/><span>{player.currentTeam ? player.currentTeam.name : 'Free agent'}</span></div>
    <div className="badge-row">{player.roles.length ? player.roles.slice(0, 3).map((role) => <Badge key={role}>{role}</Badge>) : <Badge>Roles unset</Badge>}</div>
    <p className="player-card__bio">{player.bio || 'This player has not added a field note yet.'}</p>
    <div className="player-card__footer"><Link className="text-link" to={`/players/${player.steamId}`}>View dossier <Icon name="arrow" size={15}/></Link>{onInvite && !ownProfile && <Button size="sm" tone="secondary" icon="invite" onClick={() => onInvite(player)}>Invite</Button>}</div>
  </article>;
}

export function TeamCard({ team }: { team: TeamSummary }) {
  return <article className="panel team-card">
    <div className="team-card__header"><TeamEmblem variant={team.emblem}/><div><div className="team-card__name"><Link to={`/teams/${team.id}`}>{team.name}</Link>{team.recruiting ? <Badge tone="success" dot>Recruiting</Badge> : <Badge>Closed</Badge>}</div><div className="muted-line"><span>{team.region || 'Global'}</span><i/><span>Led by {team.ownerName || 'Team captain'}</span></div></div></div>
    <p>{team.description || 'No team briefing has been filed yet.'}</p>
    <div className="team-card__data"><div><small>Line-up</small><strong>{team.memberCount}<span>/5</span></strong></div><div><small>Rank window</small><strong>{formatRank(team.rankMin)}–{formatRank(team.rankMax)}</strong></div></div>
    <div className="badge-row">{team.openRoles.length ? team.openRoles.slice(0, 4).map((role) => <Badge key={role} tone="gold">{role}</Badge>) : <Badge>No listed openings</Badge>}</div>
    <Link className="text-link team-card__link" to={`/teams/${team.id}`}>Open team room <Icon name="arrow" size={15}/></Link>
  </article>;
}
