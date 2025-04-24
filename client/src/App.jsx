import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";

function App() {
  const [user, setUser] = useState(null);
  const [userCount, setUserCount] = useState(1203);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser(data);
        }
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setUserCount((prev) => prev + Math.floor(Math.random() * 3));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-white/10 backdrop-blur-md">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          🎮 CS2Squad
        </Link>
        {user ? (
          <span className="bg-green-500 text-black font-bold py-2 px-4 rounded-full shadow transition cursor-default">
            Welcome back!
          </span>
        ) : (
          <a
            href="http://localhost:5000/auth/steam"
            className="bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-4 rounded-full shadow transition"
          >
            Sign in with Steam
          </a>
        )}

      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home user={user} userCount={userCount} />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}

export default App;
