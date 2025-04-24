// src/components/HowItWorksCard.jsx
import React from "react";

function HowItWorksCard() {
  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-purple-400">🧭 How It Works</h3>
      <ol className="list-decimal text-gray-300 text-sm list-inside space-y-1">
        <li>Log in with your Steam account</li>
        <li>Create or update your profile</li>
        <li>Find compatible teammates</li>
        <li>Squad up and play!</li>
      </ol>
    </div>
  );
}

export default HowItWorksCard;
