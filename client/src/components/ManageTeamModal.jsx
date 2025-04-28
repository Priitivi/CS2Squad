import React, { useState } from "react";
import { addTeammateToTeam, removeTeammateFromTeam, deleteTeam } from "../services/teamService";

function ManageTeamModal({ team, userSteamId, onClose, onUpdated }) {
  const [newTeammateId, setNewTeammateId] = useState("");
  const [localTeam, setLocalTeam] = useState(team); // Local copy
  const [confirmDelete, setConfirmDelete] = useState(false); // NEW

  const handleAddTeammate = async () => {
    if (!newTeammateId.trim()) return;
    try {
      await addTeammateToTeam(userSteamId, team.name, newTeammateId);
      setLocalTeam((prev) => ({
        ...prev,
        members: [...prev.members, newTeammateId],
      }));
      setNewTeammateId("");
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
      await deleteTeam(userSteamId, team.originalIndex); // ✅ Correct API call
      onUpdated(`Deleted team ${team.name}`);
      onClose();
    } catch (err) {
      console.error("Failed to delete team:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full text-white">
        <h2 className="text-2xl font-bold mb-4">Manage {team.name}</h2>

        {/* Teammates list */}
        <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
          {localTeam.members.length === 0 ? (
            <p className="text-gray-400 text-sm">No teammates yet.</p>
          ) : (
            localTeam.members.map((teammateId, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded">
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

        {/* Add new teammate */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTeammateId}
            onChange={(e) => setNewTeammateId(e.target.value)}
            placeholder="Enter Steam ID"
            className="flex-1 p-2 rounded bg-gray-700 text-white"
          />
          <button
            onClick={handleAddTeammate}
            className="bg-green-500 hover:bg-green-600 text-black font-bold px-3 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* Confirm Delete */}
        {confirmDelete ? (
          <div className="flex flex-col gap-3 mb-4">
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
            className="w-full mb-4 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded"
          >
            Delete Team
          </button>
        )}

        {/* Close Button */}
        <div className="flex justify-end gap-3">
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
