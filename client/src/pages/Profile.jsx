import React, { useEffect, useState } from "react";

const REGIONS = ["EU", "NA", "ASIA"];
const RANKS = ["0-5000", "5000-10000", "10000-15000", "15000-20000", "20000-25000", "25000+"];
const ROLES = ["Entry Fragger", "AWPer", "Support", "Lurker", "IGL"];

function Profile() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ region: "", rank: "", roles: [] });
  const [errors, setErrors] = useState({});


  useEffect(() => {
    fetch("http://localhost:5000/profile", {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setForm({
          region: data.region || "",
          rank: data.rank || "",
          roles: data.roles || [],
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setForm(prev => ({
        ...prev,
        roles: checked
          ? [...prev.roles, value]
          : prev.roles.filter(role => role !== value),
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    const newErrors = {};
    if (!form.region) newErrors.region = "Please select a region.";
    if (!form.rank) newErrors.rank = "Please select a rank.";
    if (form.roles.length === 0) newErrors.roles = "Select at least one role.";
  
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
  
    // clear errors before submitting
    setErrors({});
  
    fetch(`http://localhost:5000/users/${user.steamId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        alert("✅ Profile updated!");
        setUser(data.user);
      })
      .catch(err => {
        console.error("Error updating profile", err);
        alert("❌ Failed to update.");
      });
  };
  

  if (!user) return <div className="text-white p-4">Loading profile...</div>;

  return (
    <div className="text-white p-4">
      <h1 className="text-2xl font-bold mb-2">Your Steam Profile</h1>
      <div className="flex items-center mb-4">
        <img src={user.avatar} alt="Avatar" className="rounded-full w-24 h-24 mr-4" />
        <div>
          <p className="text-lg"><strong>Username:</strong> {user.username}</p>
          <a href={user.steamProfile} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">
            View Steam Profile
          </a>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Region</label>
          <select name="region" value={form.region} onChange={handleChange} className="text-black p-1 rounded">
            <option value="">Select Region</option>
            {REGIONS.map(region => <option key={region} value={region}>{region}</option>)}
          </select>
          {errors.region && <p className="text-red-400 text-sm">{errors.region}</p>}
        </div>

        <div>
          <label className="block">Rank</label>
          <select name="rank" value={form.rank} onChange={handleChange} className="text-black p-1 rounded">
            <option value="">Select Rank</option>
            {RANKS.map(rank => <option key={rank} value={rank}>{rank}</option>)}
          </select>
          {errors.rank && <p className="text-red-400 text-sm">{errors.rank}</p>}

        </div>

        <div>
          <label className="block">Roles</label>
          {ROLES.map(role => (
            <label key={role} className="block">
              <input
                type="checkbox"
                name="roles"
                value={role}
                checked={form.roles.includes(role)}
                onChange={handleChange}
              />
              <span className="ml-2">{role}</span>
            </label>
          ))}
          {errors.roles && <p className="text-red-400 text-sm">{errors.roles}</p>}

        </div>

        <button type="submit" className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
          Update Profile
        </button>
      </form>
    </div>
  );
}

export default Profile;
