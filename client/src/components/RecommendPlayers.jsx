import React from "react";

function RecommendPlayers() {
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

export default RecommendPlayers;
