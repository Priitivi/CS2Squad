import React from "react";

function CTACard() {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold mb-2">Ready to Squad Up?</h3>
        <p className="text-sm mb-4">
          Join thousands of players building the ultimate CS2 teams. Create your profile, filter by playstyle, and start climbing the ranks—together.
        </p>
      </div>
      <a
        href="http://localhost:5000/auth/steam"
        className="bg-white text-green-600 hover:text-green-700 text-center font-bold py-2 px-4 rounded-lg shadow transition duration-200"
      >
        Build Your Squad
      </a>
    </div>
  );
}

export default CTACard;
