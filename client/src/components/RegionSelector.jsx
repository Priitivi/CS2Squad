import React from "react";
import globe from "../assets/globe.png";

const regions = [
  { name: "NA", top: "34%", left: "22%" },
  { name: "EU", top: "28%", left: "49%" },
  { name: "SA", top: "70%", left: "33%" },
  { name: "AF", top: "58%", left: "52%" },
  { name: "ASIA", top: "33%", left: "73%" },
  { name: "OCE", top: "61%", left: "81%" },
];

function RegionSelector({ selectedRegion, onSelect }) {
  return (
    <div className="relative w-full h-60 bg-gray-800 rounded overflow-hidden">
      <img src={globe} alt="World Map" className="w-full h-full object-cover opacity-70" />
      {regions.map((region) => (
        <button
          key={region.name}
          className={`absolute text-xs font-bold px-2 py-1 rounded-full transition transform -translate-x-1/2 -translate-y-1/2 ${
            selectedRegion === region.name
              ? "bg-green-500 text-black"
              : "bg-white/20 text-white hover:bg-white/40"
          }`}
          style={{ top: region.top, left: region.left }}
          onClick={() => onSelect(region.name)}
        >
          {region.name}
        </button>
      ))}
    </div>
  );
}

export default RegionSelector;
