import React from "react";

function ProfileHeader({ user, onEditClick }) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
      <img
        src={user.avatar}
        alt="Avatar"
        className="w-32 h-32 rounded-full border-4 border-green-400 shadow-lg"
      />
      <div className="flex-1">
        <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
        <a
          href={user.steamProfile}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline text-sm"
        >
          View Steam Profile
        </a>

        <div className="mt-4 space-y-2">
          <p>
            <span className="font-semibold text-green-400">Steam ID:</span>{" "}
            {user.steamId}
          </p>
          <p>
            <span className="font-semibold text-yellow-400">Rank:</span>{" "}
            {user.rank || "Unranked"}
          </p>
          <p>
            <span className="font-semibold text-blue-400">Region:</span>{" "}
            {user.region || "Not set"}
          </p>
          <p>
            <span className="font-semibold text-purple-400">Roles:</span>{" "}
            {user.roles?.length ? user.roles.join(", ") : "None selected"}
          </p>
        </div>

        <button
          className="mt-6 bg-green-500 hover:bg-green-600 text-black font-bold py-2 px-6 rounded-full shadow transition"
          onClick={onEditClick}
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}

export default ProfileHeader;
