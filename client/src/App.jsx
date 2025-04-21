import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/"
            element={
              <div className="text-center p-4">
                <h1 className="text-4xl font-bold mb-4">Welcome to CS2Squad</h1>
                <p className="text-lg mb-4">This is the homepage 🚀</p>
                <a
                  href="http://localhost:5000/auth/steam"
                  className="text-blue-400 underline hover:text-blue-600"
                >
                  Login via Steam
                </a>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
