// src/components/StatCard.jsx
import React from "react";

function StatCard() {
  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-blue-400">📈 Stats</h3>
      <div className="text-gray-300 text-sm space-y-2">
        <p>✅ 3,200+ squads formed</p>
        <p>🌍 Users from 40+ countries</p>
        <p>🎮 95% teammate rating</p>
      </div>
    </div>
  );
}

export default StatCard;