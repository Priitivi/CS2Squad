import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import YourTeamsSection from "../components/YourTeamsSection";
import RecommendPlayers from "../components/RecommendPlayers";
import EditProfileModal from "../components/EditProfileModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/profile", { credentials: "include" });
      const data = await res.json();
      if (data.username) {
        console.log("🔥 Fetched updated profile:", data); // ADD THIS LINE
        setUser({
          ...data,
          teams: data.teams || [],
        });
      }
    } catch {
      setUser(null);
    }
  };
  

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    await fetchUserProfile(); 
    setShowModal(false);
  };
  

  const handleClose = () => setShowModal(false);

  if (!user) {
    return (
      <div className="text-white p-6">
        <h2 className="text-center text-2xl mt-24">
          Please log in via Steam to view your profile.
        </h2>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-lg text-white">
      <ProfileHeader user={user} onEditClick={() => setShowModal(true)} />
      <YourTeamsSection
        userTeams={user.teams || []}
        userSteamId={user.steamId}
        onTeamsUpdated={fetchUserProfile}
      />
      <RecommendPlayers />
      {showModal && (
        <EditProfileModal
          user={user}
          onClose={handleClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

export default Profile;
