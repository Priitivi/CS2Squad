import { useEffect, useState } from 'react';
import { useToast } from '../context/ToastContext';
import { api, ApiError } from '../lib/api';
import type { Player, TeamSummary } from '../types';
import { Button, Dialog, Field, Select } from './UI';

export function InviteDialog({ player, teams, onClose }: { player: Player | null; teams: TeamSummary[]; onClose: () => void }) {
  const [teamId, setTeamId] = useState<number>(teams[0]?.id || 0);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { notify } = useToast();
  useEffect(() => { setTeamId(teams[0]?.id || 0); setError(''); }, [player, teams]);
  const send = async () => {
    if (!player || !teamId) return;
    setSending(true); setError('');
    try { const result = await api.invite(teamId, player.steamId); notify(result.message); onClose(); }
    catch (reason) { setError(reason instanceof ApiError ? reason.message : 'Invitation could not be sent.'); }
    finally { setSending(false); }
  };
  return <Dialog open={Boolean(player)} title={`Invite ${player?.username || 'player'}`} description="Choose one of your team rooms. The player must accept before the roster changes." onClose={onClose}>{teams.length ? <><Field label="Team room"><Select value={teamId} onChange={(event) => setTeamId(Number(event.target.value))}>{teams.map((team) => <option key={team.id} value={team.id}>{team.name} · {team.memberCount}/5</option>)}</Select></Field>{error && <div className="inline-alert inline-alert--error" role="alert">{error}</div>}<div className="dialog__actions"><Button tone="ghost" onClick={onClose}>Cancel</Button><Button icon="invite" disabled={sending} onClick={send}>{sending ? 'Sending…' : 'Send invitation'}</Button></div></> : <><div className="inline-alert">Create a team before inviting players.</div><div className="dialog__actions"><Button tone="ghost" onClick={onClose}>Close</Button></div></>}</Dialog>;
}
