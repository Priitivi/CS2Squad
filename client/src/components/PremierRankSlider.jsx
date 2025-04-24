import React from "react";

function PremierRankSlider({ value, onChange }) {
  const getColor = (rank) => {
    if (rank < 5000) return "bg-gray-500";
    if (rank < 10000) return "bg-cyan-400";
    if (rank < 15000) return "bg-blue-500";
    if (rank < 20000) return "bg-purple-500";
    if (rank < 25000) return "bg-pink-500";
    if (rank < 30000) return "bg-red-600";
    return "bg-yellow-400";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-white mb-1">
        Premier Rank: <span className="text-green-400">{value}</span>
      </label>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="30000"
          step="100"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${getColor(value)}`}
        />
      </div>
    </div>
  );
}

export default PremierRankSlider;
