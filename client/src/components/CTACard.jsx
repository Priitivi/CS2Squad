import React from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function CTACard({ user }) {
  return (
    <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold mb-2">Ready to Dive In?</h3>
        <p className="text-sm mb-4">
          Join the app, set up your profile, and start connecting with players who match your playstyle and goals.
        </p>
      </div>

      {user ? (
        <Link
          to="/profile"
          className="bg-white text-green-600 hover:text-green-700 text-center font-bold py-2 px-4 rounded-lg shadow transition duration-200"
        >
          Go to Your Profile
        </Link>
      ) : (
        <a
          href={`${API_BASE}/auth/steam`}
          className="bg-white text-green-600 hover:text-green-700 text-center font-bold py-2 px-4 rounded-lg shadow transition duration-200"
        >
          Log In with Steam
        </a>
      )}

      <a
        href="https://github.com/priitivi/cs2squad"
        className="mt-3 text-sm text-white hover:underline text-center"
        target="_blank"
        rel="noopener noreferrer"
      >
        View Source on GitHub
      </a>
    </div>
  );
}

export default CTACard;
