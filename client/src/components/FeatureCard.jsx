import React from "react";

function FeatureCard() {
  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-green-400">🔥 Core Features</h3>
      <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
        <li>Match teammates by rank & role</li>
        <li>Filter by region and playstyle</li>
        <li>Instant squad invites</li>
        <li>Steam login — no signup required</li>
      </ul>
    </div>
  );
}

export default FeatureCard;
