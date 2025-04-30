import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import YourTeamsSection from "../components/YourTeamsSection";
import RecommendPlayers from "../components/RecommendPlayers";
import EditProfileModal from "../components/EditProfileModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fetchUserProfile = () => {
    fetch("http://localhost:5000/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) {
          setUser({ ...data, teams: data.teams || [] });
        }
      })
      .catch(() => setUser(null));
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSave = () => {
    fetchUserProfile();
    setShowModal(false);
  };

  const handleTeamsUpdated = (message) => {
    fetchUserProfile();
    if (message) {
      setToastMessage(message);
      setTimeout(() => setToastMessage(""), 3000);
    }
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
    <div className="max-w-4xl mx-auto mt-20 p-6 bg-white/5 backdrop-blur-md rounded-xl shadow-lg text-white relative">
      {toastMessage && (
        <div className="absolute top-0 left-0 right-0 bg-green-500 text-black text-center py-2 font-bold rounded-t-lg shadow transition-all duration-500 ease-in-out">
          {toastMessage}
        </div>
      )}

      <ProfileHeader user={user} onEditClick={() => setShowModal(true)} />

      <YourTeamsSection
        userTeams={user.teams || []}
        userSteamId={user.steamId}
        onTeamsUpdated={handleTeamsUpdated}
      />

      <RecommendPlayers />

      {showModal && (
        <EditProfileModal user={user} onClose={handleClose} onSave={handleSave} />
      )}
    </div>
  );
}

export default Profile;
