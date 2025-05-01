import React from "react";

function ExtraCard() {
  return (
    <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold mb-2">Why CS2Squad?</h3>
        <p className="text-sm mb-4">
          This app connects Counter-Strike 2 players by combining rank, region, and role preferences. Designed to make finding teammates faster, smarter, and more fun.
        </p>
      </div>
      <a
        href="/profile"
        className="text-blue-400 hover:underline mt-2"
      >
        Explore your profile
      </a>
    </div>
  );
}

export default ExtraCard;
