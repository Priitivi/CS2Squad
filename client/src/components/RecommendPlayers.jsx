import React, { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function RecommendPlayers() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/users`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        // Pick 3 random players
        const shuffled = data.sort(() => 0.5 - Math.random());
        setPlayers(shuffled.slice(0, 3));
      })
      .catch((err) => console.error("❌ Failed to load recommended players:", err));
  }, []);

  if (players.length === 0) return null;

  return (
    <div className="mt-10 p-6 bg-gray-800 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Start Adding People!</h2>
      <div className="flex justify-center gap-6">
        {players.map((player) => (
          <div
            key={player.steamId}
            className="w-32 h-48 perspective"
            onClick={() =>
              window.open(`https://steamcommunity.com/profiles/${player.steamId}`, "_blank")
            }
          >
            <div className="relative w-full h-full transform-style preserve-3d transition-transform duration-500 hover:rotate-y-180 group cursor-pointer">
              {/* Front */}
              <div className="absolute w-full h-full backface-hidden">
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-full h-full object-cover rounded-xl border-2 border-green-500 shadow-lg group-hover:shadow-green-400 transition-shadow duration-300"
                />
              </div>
              {/* Back */}
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-black text-white p-2 flex flex-col justify-center items-center rounded-xl">
                <p className="text-sm font-bold">{player.username}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Rank: {player.rank || "Unranked"}
                </p>
                <p className="text-xs text-gray-400">
                  Region: {player.region || "N/A"}
                </p>
                <p className="text-[10px] mt-2 text-blue-300">
                  Click to view on Steam
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendPlayers;
