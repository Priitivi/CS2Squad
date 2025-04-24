import React, { useEffect, useState } from "react";
import silhouetteImage from "../assets/silhouettes.png";
import ProfileHeader from "../components/ProfileHeader";
import YourTeamsSection from "../components/YourTeamsSection";
import RecommendPlayers from "../components/RecommendPlayers";
import EditProfileModal from "../components/EditProfileModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.username) setUser(data);
      })
      .catch(() => setUser(null));
  }, []);

  const handleSave = (updatedData) => {
    // For now, just update local state. You can call your update API here later.
    setUser({ ...user, ...updatedData });
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
      <YourTeamsSection />
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
