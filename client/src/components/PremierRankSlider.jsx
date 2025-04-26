import React from "react";

function PremierRankSlider({ value, onChange }) {
  const getColorByRank = (rank) => {
    if (rank < 5000) return "bg-gray-500";
    if (rank < 10000) return "bg-cyan-500";
    if (rank < 15000) return "bg-blue-500";
    if (rank < 20000) return "bg-purple-500";
    if (rank < 25000) return "bg-pink-500";
    if (rank < 30000) return "bg-red-500";
    return "bg-yellow-400";
  };

  return (
    <div>
      <label className="block mb-2 font-medium">Premier Rank</label>

      {/* Rank Number Display */}
      <div className="flex justify-center mb-4">
        <div
          className={`px-4 py-2 rounded text-black font-bold ${getColorByRank(
            value
          )}`}
        >
          {value}
        </div>
      </div>

      {/* Slider */}
      <input
        type="range"
        min="0"
        max="30000"
        step="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full"
      />

      {/* Rank Ranges */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Gray</span>
        <span>Cyan</span>
        <span>Blue</span>
        <span>Purple</span>
        <span>Pink</span>
        <span>Red</span>
        <span>Gold</span>
      </div>
    </div>
  );
}

export default PremierRankSlider;
