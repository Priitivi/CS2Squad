import type { Invitation, Pagination, Player, Profile, ProfileInput, TeamDetail, TeamInput, TeamSummary } from '../types';
import { withQuery } from './utils';

export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code = 'REQUEST_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body) headers.set('Content-Type', 'application/json');
  const activeToken = token === undefined ? localStorage.getItem('cs2squad_token') : token;
  if (activeToken) headers.set('Authorization', `Bearer ${activeToken}`);

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({})) as { message?: string; code?: string };
  if (!response.ok) {
    if (response.status === 401 && activeToken) window.dispatchEvent(new CustomEvent('cs2squad:session-expired'));
    throw new ApiError(response.status, payload.message || 'The request could not be completed.', payload.code);
  }
  return payload as T;
}

type DiscoveryFilters = Record<string, string | number | boolean | undefined>;

export const api = {
  stats: (signal?: AbortSignal) => request<{ players: number; teams: number; recruitingTeams: number }>('/stats', { signal }, null),
  profile: (token?: string) => request<Profile>('/profile', {}, token),
  updateProfile: (input: ProfileInput) => request<{ message: string; user: Player }>('/users/me/profile', { method: 'PATCH', body: JSON.stringify(input) }),
  players: (filters: DiscoveryFilters = {}, signal?: AbortSignal) => request<{ players: Player[]; pagination: Pagination }>(withQuery('/users', filters), { signal }),
  player: (id: string, signal?: AbortSignal) => request<Player>(`/users/${encodeURIComponent(id)}`, { signal }),
  teams: (filters: DiscoveryFilters = {}, signal?: AbortSignal) => request<{ teams: TeamSummary[]; pagination: Pagination }>(withQuery('/team', filters), { signal }),
  myTeams: () => request<{ teams: TeamSummary[] }>('/team/mine'),
  team: (id: number, signal?: AbortSignal) => request<TeamDetail>(`/team/${id}`, { signal }),
  createTeam: (input: TeamInput) => request<{ message: string; team: TeamSummary }>('/team', { method: 'POST', body: JSON.stringify(input) }),
  updateTeam: (id: number, input: Partial<TeamInput>) => request<{ message: string; team: TeamSummary }>(`/team/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteTeam: (id: number) => request<{ message: string }>(`/team/${id}`, { method: 'DELETE' }),
  leaveTeam: (id: number) => request<{ message: string }>(`/team/${id}/leave`, { method: 'POST' }),
  removeMember: (teamId: number, memberId: string) => request<{ message: string; team: TeamSummary }>(`/team/${teamId}/members/${memberId}`, { method: 'DELETE' }),
  transferOwner: (teamId: number, ownerId: string) => request<{ message: string }>(`/team/${teamId}/owner`, { method: 'PATCH', body: JSON.stringify({ ownerId }) }),
  invite: (teamId: number, recipientId: string) => request<{ message: string }>(`/team/${teamId}/invitations`, { method: 'POST', body: JSON.stringify({ recipientId }) }),
  invitations: (scope: 'received' | 'sent' | 'all' = 'received', status = 'all', signal?: AbortSignal) => request<{ invitations: Invitation[] }>(withQuery('/invitations', { scope, status }), { signal }),
  acceptInvitation: (id: number) => request<{ message: string }>(`/invitations/${id}/accept`, { method: 'POST' }),
  declineInvitation: (id: number) => request<{ message: string }>(`/invitations/${id}/decline`, { method: 'POST' }),
  cancelInvitation: (id: number) => request<{ message: string }>(`/invitations/${id}/cancel`, { method: 'POST' }),
};
