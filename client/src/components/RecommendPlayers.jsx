// client/src/components/RecommendPlayers.jsx
import React, { useEffect, useState } from "react";

function RecommendPlayers() {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const res = await fetch("http://localhost:5000/users", {
          credentials: "include",
        });
        const data = await res.json();
        setPlayers(data.sort(() => 0.5 - Math.random()).slice(0, 5)); // Random 5 players
      } catch (err) {
        console.error("❌ Failed to load recommended players:", err);
      }
    };

    fetchPlayers();
  }, []);

  if (players.length === 0) {
    return (
      <div className="mt-10 p-6 bg-gray-800 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Start Adding People!</h2>
        <p className="text-gray-400 text-sm mb-4">
          Recommended players based on your region and rank will appear here soon.
        </p>
        <div className="flex space-x-4">
          <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 p-6 bg-gray-800 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-6 text-center">Start Adding People!</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 justify-center">
        {players.map((player) => (
          <div
            key={player.steamId}
            className="relative w-32 h-40 cursor-pointer group perspective mx-auto"
            onClick={() => window.open(`https://steamcommunity.com/profiles/${player.steamId}`, "_blank")}
          >
            <div className="relative w-full h-full transition-transform duration-500 transform-style-preserve-3d group-hover:rotate-y-180">
              {/* Front */}
              <div className="absolute w-full h-full rounded-xl bg-gray-700 flex items-center justify-center">
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-24 h-24 rounded-full border-2 border-green-400 shadow-lg"
                />
              </div>

              {/* Back */}
              <div className="absolute w-full h-full rounded-xl bg-green-600 text-black p-2 transform rotate-y-180 flex flex-col justify-center items-center text-center">
                <h3 className="text-sm font-bold">{player.username}</h3>
                <p className="text-xs mt-1">{player.region || "Unknown Region"}</p>
                <p className="text-xs">{player.rank ? `Rank ${player.rank}` : "Unranked"}</p>
                <p className="text-xs mt-2">View Steam Profile ➔</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecommendPlayers;
