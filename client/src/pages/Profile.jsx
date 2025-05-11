import React, { useEffect, useState } from "react";
import ProfileHeader from "../components/ProfileHeader";
import YourTeamsSection from "../components/YourTeamsSection";
import RecommendPlayers from "../components/RecommendPlayers";
import EditProfileModal from "../components/EditProfileModal";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });


      if (res.status === 401) {
        console.log("🔒 Not authenticated for profile page");
        setUser(null);
      } else {
        const data = await res.json();
        if (data.username) {
          setUser({ ...data, teams: data.teams || [] });
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error("❌ Error loading profile:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [API_BASE]);

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

  if (loading) {
    return (
      <div className="text-white p-6">
        <h2 className="text-center text-2xl mt-24">Loading profile...</h2>
      </div>
    );
  }

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

      <RecommendPlayers currentUser={user} />


      {showModal && (
        <EditProfileModal user={user} onClose={handleClose} onSave={handleSave} />
      )}
    </div>
  );
}

export default Profile;
