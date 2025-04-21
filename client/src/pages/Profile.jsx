import React, { useEffect, useState } from "react";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      credentials: "include", // send session cookie
    })
      .then((res) => {
        console.log("Response status:", res.status); // ✅ LOG 1
        return res.json();
      })
      .then((data) => {
        console.log("Fetched data:", data); // ✅ LOG 2
        if (!data.username) throw new Error("Not logged in");
        setUser(data);
      })
      .catch((err) => {
        console.error("Error fetching profile:", err); // ✅ LOG 3
        setUser(null);
      });
  }, []);
  

  if (!user) {
    return (
      <div className="text-white p-4">
        <h2>Please log in via Steam to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-2">Your Steam Profile</h1>
      <div className="flex items-center">
        <img
          src={user.avatar}
          alt="Avatar"
          className="rounded-full w-24 h-24 mr-4"
        />
        <div>
          <p className="text-lg">
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <a
              href={user.steamProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline hover:text-blue-600"
            >
              View Steam Profile
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;
