export type Visibility = 'public' | 'members' | 'private';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface TeamSummary {
  id: number;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  region: string;
  rankMin: number | null;
  rankMax: number | null;
  openRoles: string[];
  recruiting: boolean;
  emblem: string;
  memberIds: string[];
  memberCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Player {
  steamId: string;
  username: string;
  avatar: string | null;
  steamProfile: string;
  bio: string;
  region: string;
  rank: number | null;
  roles: string[];
  language: string;
  availability: string[];
  playStyle: string;
  goals: string;
  profileVisibility: Visibility;
  recruitmentStatus: boolean;
  profileCompleted: boolean;
  currentTeam: Pick<TeamSummary, 'id' | 'name'> | null;
  teams?: TeamSummary[];
}

export interface Profile extends Player {
  teams: TeamSummary[];
  ownedTeams: TeamSummary[];
  currentTeam: TeamSummary | null;
  pendingInvitationCount: number;
}

export interface TeamDetail extends TeamSummary {
  owner: Player;
  members: Player[];
  viewerRole: 'owner' | 'member' | 'visitor';
}

export interface Invitation {
  id: number;
  status: InvitationStatus;
  team: { id: number; name: string; emblem: string };
  sender: Pick<Player, 'steamId' | 'username' | 'avatar'>;
  recipient: Pick<Player, 'steamId' | 'username' | 'avatar'>;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProfileInput {
  username?: string;
  bio?: string;
  region?: string;
  rank?: number;
  roles?: string[];
  language?: string;
  availability?: string[];
  playStyle?: string;
  goals?: string;
  profileVisibility?: Visibility;
  recruitmentStatus?: boolean;
}

export interface TeamInput {
  name: string;
  description?: string;
  region?: string;
  rankMin?: number;
  rankMax?: number;
  openRoles?: string[];
  recruiting?: boolean;
  emblem?: string;
}
