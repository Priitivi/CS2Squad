import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload(); // force reload to clear state
  };

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
          <>
            <span className="bg-green-500 text-black font-bold py-2 px-4 rounded-full shadow text-sm">
              Welcome, {user.username}!
            </span>
            <button
              onClick={handleLogout}
              className="ml-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow text-sm"
            >
              Log out
            </button>
          </>
        ) : (
          <a
            href={`${import.meta.env.VITE_API_BASE_URL}/auth/steam`}
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
