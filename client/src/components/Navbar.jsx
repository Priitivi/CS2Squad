import React from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function Navbar({ user }) {
  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
      <Link to="/" className="text-2xl font-bold tracking-tight">
        🎮 CS2Squad
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/profile" className="hover:text-green-400 transition text-sm">
          Profile
        </Link>
        <Link to="/findplayers" className="hover:text-green-400 transition text-sm">
          Find Players
        </Link>

        {user ? (
          <span className="bg-green-500 text-black font-bold py-2 px-4 rounded-full shadow transition cursor-default text-sm">
            Welcome back!
          </span>
        ) : (
          <a
            href={`${API_BASE}/auth/steam`}
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full shadow transition text-sm"
          >
            Sign in with Steam
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
