function toPlayer(row) {
  return {
    steamId: String(row.steam_id),
    username: row.username,
    avatar: row.avatar,
    steamProfile: `https://steamcommunity.com/profiles/${row.steam_id}`,
    bio: row.bio || '',
    region: row.region || '',
    rank: row.rank === null || row.rank === undefined ? null : Number(row.rank),
    roles: row.roles || [],
    language: row.language || '',
    availability: row.availability || [],
    playStyle: row.play_style || '',
    goals: row.goals || '',
    profileVisibility: row.profile_visibility || 'public',
    recruitmentStatus: row.recruitment_status !== false,
    profileCompleted: Boolean(row.profile_completed),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    currentTeam: row.current_team_id ? {
      id: Number(row.current_team_id),
      name: row.current_team_name,
    } : null,
  };
}

function toTeam(row) {
  const members = Array.isArray(row.members) ? row.members.map(String) : [];
  return {
    id: Number(row.id),
    name: row.name,
    description: row.description || '',
    ownerId: String(row.owner_id),
    ownerName: row.owner_name || '',
    region: row.region || '',
    rankMin: row.rank_min === null || row.rank_min === undefined ? null : Number(row.rank_min),
    rankMax: row.rank_max === null || row.rank_max === undefined ? null : Number(row.rank_max),
    openRoles: row.open_roles || [],
    recruiting: row.recruiting !== false,
    emblem: row.emblem || 'vanguard',
    memberIds: members,
    memberCount: Number(row.member_count || members.length + 1),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toInvitation(row) {
  return {
    id: Number(row.id),
    status: row.status,
    team: { id: Number(row.team_id), name: row.team_name, emblem: row.emblem || 'vanguard' },
    sender: { steamId: String(row.sender_id), username: row.sender_name, avatar: row.sender_avatar },
    recipient: { steamId: String(row.recipient_id), username: row.recipient_name, avatar: row.recipient_avatar },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

module.exports = { toInvitation, toPlayer, toTeam };
