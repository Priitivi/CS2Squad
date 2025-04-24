import React from "react";
import silhouetteImage from "../assets/silhouettes.png";

function YourTeamsSection() {
  return (
    <div className="mt-10">
      <div
        className="relative bg-black/40 bg-center bg-no-repeat bg-contain h-56 rounded-xl shadow-lg overflow-hidden"
        style={{
          backgroundImage: `url(${silhouetteImage})`,
          backgroundSize: 'cover',
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center px-4 text-center">
          <h3 className="text-2xl font-bold mb-2">Your Teams</h3>
          <p className="text-sm text-gray-300 mb-4">
            No teams yet. Start your squad journey.
          </p>
          <button className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full transition shadow">
            + Add New Team
          </button>
        </div>
      </div>
    </div>
  );
}

export default YourTeamsSection;
