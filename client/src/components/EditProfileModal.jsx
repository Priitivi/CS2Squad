import React, { useState } from "react";
import PremierRankSlider from "./PremierRankSlider";
import RegionSelector from "./RegionSelector";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

function EditProfileModal({ user, onClose, onSave }) {
  const [formData, setFormData] = useState({
    rank: parseInt(user.rank) || 0,
    region: user.region || "",
    roles: user.roles || [],
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updatedRoles = checked
        ? [...prev.roles, value]
        : prev.roles.filter((role) => role !== value);
      return { ...prev, roles: updatedRoles };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    fetch(`${API_BASE}/users/${user.steamId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((updatedUser) => {
        onSave(updatedUser.user);
        setSuccess(true);

        setTimeout(() => {
          setSuccess(false);
          setTimeout(() => {
            onClose();
          }, 300);
        }, 2000);
      })
      .catch((err) => {
        console.error("Update failed:", err);
        setError("Failed to update profile. Please try again.");
      });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative bg-gray-900 p-6 rounded-lg shadow-xl max-w-md w-full">

        {success && (
          <div className="absolute top-0 left-0 right-0 bg-green-500 text-black font-semibold text-center py-2 rounded-t-lg animate-slideDown">
            Profile updated successfully! 🎉
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white text-center p-2 rounded mb-4">
            {error}
          </div>
        )}

        <h2 className="text-xl font-bold mb-6 mt-2">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-6">

          <PremierRankSlider
            value={formData.rank}
            onChange={(value) => setFormData((prev) => ({ ...prev, rank: value }))}
          />

          <div>
            <label className="block mb-2 font-medium">Select Region</label>
            <RegionSelector
              selectedRegion={formData.region}
              onSelect={(region) => setFormData((prev) => ({ ...prev, region }))}
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Roles</label>
            <div className="flex gap-3 flex-wrap">
              {["IGL", "Entry", "AWPer", "Support", "Lurker"].map((role) => (
                <label key={role} className="inline-flex items-center text-sm">
                  <input
                    type="checkbox"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                  />
                  {role}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-black font-bold"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfileModal;
