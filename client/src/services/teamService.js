// client/src/services/teamService.js

import axios from 'axios';

const API_BASE = 'http://localhost:5000/team'; // adjust if needed

export async function addTeammate(userSteamId, teammateSteamId) {
  const res = await axios.post(
    `${API_BASE}/${userSteamId}/add-teammate`,
    { teammateId: teammateSteamId },
    { withCredentials: true }
  );
  return res.data;
}

export async function removeTeammate(userSteamId, teammateSteamId) {
  const res = await axios.post(
    `${API_BASE}/${userSteamId}/remove-teammate`,
    { teammateId: teammateSteamId },
    { withCredentials: true }
  );
  return res.data;
}

export async function createTeam(userSteamId, name, members = []) {
  const res = await axios.post(
    `${API_BASE}/${userSteamId}/create-team`,
    { name, members },
    { withCredentials: true }
  );
  return res.data;
}
