// server/models/User.js

class User {
  constructor({ 
    steamId, 
    username, 
    avatar, 
    region = '', 
    rank = '', 
    roles = [], 
    availability = [] 
  }) {
    this.steamId = steamId;
    this.username = username;
    this.avatar = avatar;
    this.region = region;
    this.rank = rank;
    this.roles = roles;
    this.availability = availability;
    this.createdAt = new Date();
    this.teammates = []; 
    this.teams = [];
  }
}

module.exports = User;
