import React, { useState } from "react";
import silhouetteImage from "../assets/silhouettes.png";
import { createTeam } from "../services/teamService"; // we just made this!

function YourTeamsSection({ userTeams, userSteamId, onTeamsUpdated }) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [teamName, setTeamName] = useState("");

  const handleCreateTeam = async () => {
    if (teamName.trim()) {
      console.log("Trying to create team", teamName);
      await createTeam(userSteamId, teamName, []);
      onTeamsUpdated(); // refresh after creation
      setTeamName("");
      setShowCreateModal(false);
    }
  };

  return (
    <div className="mt-10">
      <div
        className="relative bg-black/40 bg-center bg-no-repeat bg-contain h-56 rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundImage: `url(${silhouetteImage})`,
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Your Teams</h3>

          {userTeams.length === 0 ? (
            <>
              <p className="text-sm text-gray-300 mb-4">
                No teams yet. Start your squad journey.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full transition shadow"
              >
                + Add New Team
              </button>
            </>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              {userTeams.map((team, idx) => (
                <div key={idx} className="bg-white/10 px-4 py-2 rounded-lg text-white text-sm shadow">
                  {team.name}
                </div>
              ))}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-bold py-1 px-3 rounded-full text-sm shadow"
              >
                + New
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Create New Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full text-white">
            <h2 className="text-xl mb-4 font-bold">Create New Team</h2>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Team Name"
              className="w-full p-2 rounded bg-gray-700 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-black font-bold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default YourTeamsSection;
