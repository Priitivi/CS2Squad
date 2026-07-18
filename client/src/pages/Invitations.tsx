import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TeamEmblem } from '../components/Brand';
import { Icon } from '../components/Icon';
import { Avatar, Badge, Button, Dialog, PageHeader, Panel, StateView } from '../components/UI';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import { relativeDate } from '../lib/utils';
import type { Invitation } from '../types';

type Scope = 'received' | 'sent';

export default function Invitations() {
  const { refresh } = useAuth();
  const { notify } = useToast();
  const [scope, setScope] = useState<Scope>('received');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acceptTarget, setAcceptTarget] = useState<Invitation | null>(null);
  const load = useCallback(() => { const controller = new AbortController(); setLoading(true); setError(''); api.invitations(scope, status, controller.signal).then((data) => setItems(data.invitations)).catch((reason: Error) => { if (reason.name !== 'AbortError') setError(reason.message); }).finally(() => setLoading(false)); return () => controller.abort(); }, [scope, status]);
  useEffect(() => load(), [load]);
  const act = async (invitation: Invitation, action: 'accept' | 'decline' | 'cancel') => { try { const result = action === 'accept' ? await api.acceptInvitation(invitation.id) : action === 'decline' ? await api.declineInvitation(invitation.id) : await api.cancelInvitation(invitation.id); notify(result.message); setAcceptTarget(null); await refresh(); load(); } catch (reason) { notify(reason instanceof ApiError ? reason.message : 'Invitation could not be updated.', 'error'); } };
  const pendingCount = items.filter((item) => item.status === 'pending').length;
  return <div className="page section-shell invitations-page"><PageHeader eyebrow="Communications / Invitations" title="Control who joins the line-up." description="Every roster change stays pending until the invited player explicitly accepts." actions={<Badge tone={pendingCount ? 'gold' : 'neutral'}>{pendingCount} pending</Badge>}/><div className="tab-bar" role="tablist" aria-label="Invitation direction"><button role="tab" aria-selected={scope === 'received'} className={scope === 'received' ? 'is-active' : ''} onClick={() => setScope('received')}><Icon name="invite"/>Received</button><button role="tab" aria-selected={scope === 'sent'} className={scope === 'sent' ? 'is-active' : ''} onClick={() => setScope('sent')}><Icon name="arrow"/>Sent</button><span/><label>Status <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="declined">Declined</option><option value="cancelled">Cancelled</option></select></label></div>{error ? <StateView tone="error" icon="invite" title="Invitation channel failed" message={error} action={<Button onClick={load}>Retry</Button>}/> : loading ? <div className="invitation-list">{[1,2,3].map((item) => <Panel className="invitation-card skeleton-card" key={item}><span/><span/><span/></Panel>)}</div> : items.length ? <div className="invitation-list">{items.map((invitation) => { const counterpart = scope === 'received' ? invitation.sender : invitation.recipient; return <Panel className="invitation-card" key={invitation.id}><div className="invitation-card__team"><TeamEmblem variant={invitation.team.emblem}/><div><div className="eyebrow">Team invitation / #{String(invitation.id).padStart(4, '0')}</div><Link to={`/teams/${invitation.team.id}`}>{invitation.team.name}</Link><span>{scope === 'received' ? 'Invited by' : 'Sent to'} {counterpart.username} · {relativeDate(invitation.createdAt)}</span></div></div><div className="invitation-card__counterpart"><Avatar src={counterpart.avatar} name={counterpart.username} size="sm"/><Link to={`/players/${counterpart.steamId}`}>{counterpart.username}</Link></div><Badge tone={invitation.status === 'pending' ? 'gold' : invitation.status === 'accepted' ? 'success' : 'neutral'} dot>{invitation.status}</Badge>{invitation.status === 'pending' && <div className="invitation-card__actions">{scope === 'received' ? <><Button tone="ghost" size="sm" onClick={() => act(invitation, 'decline')}>Decline</Button><Button size="sm" onClick={() => setAcceptTarget(invitation)}>Accept</Button></> : <Button tone="danger" size="sm" onClick={() => act(invitation, 'cancel')}>Cancel</Button>}</div>}</Panel>; })}</div> : <StateView icon="invite" title={`No ${status === 'all' ? '' : status + ' '}invitations`} message={scope === 'received' ? 'When a captain contacts you, the invitation will appear here.' : 'Invitations sent from your team rooms will be tracked here.'}/>}<Dialog open={Boolean(acceptTarget)} title={`Join ${acceptTarget?.team.name}?`} description="Accepting adds your Steam ID to this confirmed roster immediately." onClose={() => setAcceptTarget(null)}><div className="dialog__actions"><Button tone="ghost" onClick={() => setAcceptTarget(null)}>Review later</Button><Button icon="check" onClick={() => acceptTarget && act(acceptTarget, 'accept')}>Accept invitation</Button></div></Dialog></div>;
}
