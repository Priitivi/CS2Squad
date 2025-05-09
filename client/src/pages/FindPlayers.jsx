import React, { useEffect, useState } from "react";
import { addTeammateToTeam } from "../services/teamService";

function FindPlayers() {
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [inviteStatus, setInviteStatus] = useState({});
  const [selectedTeams, setSelectedTeams] = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await fetch(`${API_BASE}/profile`, {
          credentials: "include",
        });
        const profileData = await profileRes.json();

        if (profileData.username) {
          console.log("✅ Loaded current user:", profileData);
          setCurrentUser(profileData);
        }

        const usersRes = await fetch(`${API_BASE}/users`, {
          credentials: "include",
        });
        const usersData = await usersRes.json();

        console.log("✅ Loaded players:", usersData);
        setPlayers(usersData);
      } catch (err) {
        console.error("❌ Failed to fetch data:", err);
      }
    };

    fetchData();
  }, [API_BASE]);

  const handleInvite = async (playerSteamId) => {
    // ✅ FIRST: Prevent self-invite
    if (playerSteamId === currentUser.steamId) {
      alert("❌ You can't invite yourself!");
      return;
    }

    const fallbackTeamName =
      currentUser?.teams?.length > 0 ? currentUser.teams[0].name : null;
    const teamName = selectedTeams[playerSteamId] || fallbackTeamName;

    if (!teamName) {
      alert(
        "❌ You don't have any teams to invite players to. Please create a team first!"
      );
      return;
    }

    const inviteKey = `${playerSteamId}-${teamName}`;

    console.log("🚀 Clicking Invite button");
    console.log("Player ID:", playerSteamId);
    console.log("Team Name:", teamName);

    if (!currentUser?.steamId || !teamName || !playerSteamId) {
      console.warn("❌ Missing required data to send invite");
      return;
    }

    try {
      await addTeammateToTeam(currentUser.steamId, teamName, playerSteamId);
      setInviteStatus((prev) => ({ ...prev, [inviteKey]: "invited" }));

      console.log("✅ Successfully invited player");
    } catch (err) {
      console.error("❌ Invite failed:", err);
      setInviteStatus((prev) => ({ ...prev, [inviteKey]: "error" }));
    }
  };

  const handleTeamSelect = (playerSteamId, teamName) => {
    setSelectedTeams((prev) => ({ ...prev, [playerSteamId]: teamName }));
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 p-6 text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Find Players</h1>

      {players.length === 0 ? (
        <p className="text-center text-gray-400">No players found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {players.map((player) => {
            const inviteKey = `${player.steamId}-${
              selectedTeams[player.steamId] || currentUser?.teams?.[0]?.name
            }`;

            return (
              <div
                key={player.steamId}
                className="bg-white/10 rounded-xl p-6 flex flex-col items-center text-center shadow-md hover:bg-white/20 transition"
              >
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-24 h-24 rounded-full mb-4 border-2 border-green-400"
                />
                <h2 className="text-xl font-semibold mb-1">
                  {player.username}
                </h2>

                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {player.region && (
                    <span className="bg-blue-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {player.region}
                    </span>
                  )}
                  {player.rank ? (
                    <span className="bg-yellow-500/80 text-black text-xs font-semibold px-2 py-1 rounded-full">
                      {player.rank}
                    </span>
                  ) : (
                    <span className="bg-gray-500/80 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      Unranked
                    </span>
                  )}
                </div>

                {currentUser?.teams?.length > 1 && (
                  <select
                    onChange={(e) =>
                      handleTeamSelect(player.steamId, e.target.value)
                    }
                    value={
                      selectedTeams[player.steamId] ||
                      currentUser.teams[0]?.name
                    }
                    className="bg-gray-700 text-white p-2 rounded mb-3 text-sm w-full"
                  >
                    {currentUser.teams.map((team, idx) => (
                      <option key={idx} value={team.name}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                )}

                {inviteStatus[inviteKey] === "invited" ? (
                  <button
                    disabled
                    className="bg-green-500/40 text-black font-bold py-2 px-4 rounded-full opacity-70 cursor-not-allowed w-full"
                  >
                    Invited ✅
                  </button>
                ) : (
                  <button
                    onClick={() => handleInvite(player.steamId)}
                    className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full transition w-full"
                  >
                    Invite
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FindPlayers;
