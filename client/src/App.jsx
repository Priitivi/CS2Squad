import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import FindPlayers from "./pages/FindPlayers"; // 🌟 NEW
import Navbar from "./components/Navbar"; // 🌟 NEW

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
      <Navbar user={user} /> {/* 🌟 Use new Navbar here */}

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home user={user} userCount={userCount} />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/findplayers" element={<FindPlayers />} /> {/* 🌟 New Route */}
      </Routes>
    </div>
  );
}

export default App;
