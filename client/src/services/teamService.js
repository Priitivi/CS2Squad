// client/src/services/teamService.js

import axios from 'axios';

const API_BASE = 'http://localhost:5000/team';

export async function addTeammate(userSteamId, teammateSteamId) {
  const res = await axios.post(`${API_BASE}/${userSteamId}/add-teammate`, { teammateId: teammateSteamId }, { withCredentials: true });
  return res.data;
}

export async function removeTeammate(userSteamId, teammateSteamId) {
  const res = await axios.post(`${API_BASE}/${userSteamId}/remove-teammate`, { teammateId: teammateSteamId }, { withCredentials: true });
  return res.data;
}

export async function createTeam(userSteamId, teamName, memberIds) {
  const res = await axios.post(`${API_BASE}/${userSteamId}/create-team`, { name: teamName, members: memberIds }, { withCredentials: true });
  return res.data;
}

export async function renameTeam(userSteamId, teamIndex, newName) {
  const res = await axios.post(`${API_BASE}/${userSteamId}/${teamIndex}/rename`, { newName }, { withCredentials: true });
  return res.data;
}

export async function deleteTeam(userSteamId, teamIndex) {
  const res = await axios.delete(`${API_BASE}/${userSteamId}/${teamIndex}`, { withCredentials: true });
  return res.data;
}

export async function addTeammateToTeam(userSteamId, teamName, teammateId) {
  const res = await axios.post(`http://localhost:5000/team/${userSteamId}/${teamName}/add-teammate`, { teammateId }, { withCredentials: true });
  return res.data;
}

export async function removeTeammateFromTeam(userSteamId, teamName, teammateId) {
  const res = await axios.post(`http://localhost:5000/team/${userSteamId}/${teamName}/remove-teammate`, { teammateId }, { withCredentials: true });
  return res.data;
}

