import React, { useEffect, useState } from "react";
import {
  addTeammateToTeam,
  removeTeammateFromTeam,
  deleteTeam,
} from "../services/teamService";

function ManageTeamModal({ team, userSteamId, onClose, onUpdated }) {
  const [searchInput, setSearchInput] = useState(""); // 🔥 for search
  const [localTeam, setLocalTeam] = useState(team); // Local copy
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/users", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setAllPlayers(data))
      .catch((err) => console.error("Failed to fetch players:", err));
  }, []);

  const handleAddTeammate = async (teammateId) => {
    if (!teammateId) return;
    try {
      await addTeammateToTeam(userSteamId, team.name, teammateId);
      setLocalTeam((prev) => ({
        ...prev,
        members: [...prev.members, teammateId],
      }));
      onUpdated(`Added teammate to ${team.name}`);
    } catch (err) {
      console.error("Failed to add teammate:", err);
    }
  };

  const handleRemoveTeammate = async (teammateId) => {
    try {
      await removeTeammateFromTeam(userSteamId, team.name, teammateId);
      setLocalTeam((prev) => ({
        ...prev,
        members: prev.members.filter((id) => id !== teammateId),
      }));
      onUpdated(`Removed teammate from ${team.name}`);
    } catch (err) {
      console.error("Failed to remove teammate:", err);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteTeam(userSteamId, team.originalIndex);
      onUpdated(`Deleted team ${team.name}`);
      onClose();
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white relative">
        <h2 className="text-2xl font-bold mb-4">Manage {team.name}</h2>

        {/* Current teammates */}
        <div className="mb-6 space-y-2 max-h-48 overflow-y-auto">
          {localTeam.members.length === 0 ? (
            <p className="text-gray-400 text-sm">No teammates yet.</p>
          ) : (
            localTeam.members.map((teammateId, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white/10 px-3 py-2 rounded"
              >
                <span className="text-sm">{teammateId}</span>
                <button
                  onClick={() => handleRemoveTeammate(teammateId)}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded"
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>

        {/* Invite new players */}
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-2">Invite Players</h3>

          {/* 🔥 Search Input */}
          <input
            type="text"
            placeholder="Search by username..."
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {allPlayers
              .filter((player) =>
                player.username.toLowerCase().includes(searchInput.toLowerCase())
              )
              .map((player) => {
                const alreadyTeammate = localTeam.members.includes(player.steamId);
                const isSelf = player.steamId === userSteamId;
                return (
                  <div
                    key={player.steamId}
                    className="bg-white/10 p-2 rounded flex items-center gap-2"
                  >
                    <img
                      src={player.avatar}
                      alt={player.username}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-semibold truncate">
                        {player.username}
                      </div>
                      {player.region && (
                        <div className="text-[10px] text-gray-400 truncate">
                          {player.region}
                        </div>
                      )}
                    </div>
                    {alreadyTeammate || isSelf ? (
                      <button
                        disabled
                        className="bg-gray-600 text-white text-xs px-2 py-1 rounded opacity-50"
                      >
                        {isSelf ? "You" : "Added"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddTeammate(player.steamId)}
                        className="bg-green-500 hover:bg-green-600 text-black text-xs font-bold px-2 py-1 rounded"
                      >
                        Invite
                      </button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Confirm Delete */}
        {confirmDelete ? (
          <div className="flex flex-col gap-3 mt-6">
            <p className="text-center text-red-400 font-semibold text-sm">
              Are you sure you want to delete {team.name}?
            </p>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              Confirm Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500 text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded"
          >
            Delete Team
          </button>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManageTeamModal;
