const users = new Map(); // steamId -> User instance

function addUser(user) {
  users.set(user.steamId, user);
}

function getUser(steamId) {
  return users.get(steamId);
}

function getAllUsers() {
  return Array.from(users.values());
}

function updateUser(steamId, updatedFields) {
  const user = users.get(steamId);
  if (user) {
    Object.assign(user, updatedFields);
    return true;
  }
  return false;
}

// mockDB.js
function addTeamToUser(steamId, team) {
  const user = users.get(steamId);
  if (user) {
    user.teams.push(team);
    return true;
  }
  return false;
}

module.exports = {
  addUser,
  getUser,
  getAllUsers,
  updateUser,
  addTeamToUser, // NEW export
};
