// server/models/User.js

class User {
    constructor({ steamId, username, avatar, region = '', rank = '', roles = [], availability = [] }) {
      this.steamId = steamId;         // e.g., "7656119..."
      this.username = username;       // Steam display name
      this.avatar = avatar;           // Full-size avatar URL
      this.region = region;           // e.g., "EU", "NA", etc.
      this.rank = rank;               // e.g., "Gold Nova 2", "Global Elite"
      this.roles = roles;             // e.g., ["AWPer", "IGL"]
      this.availability = availability; // e.g., ["Evenings", "Weekends"]
      this.createdAt = new Date();
    }
  }
  
  module.exports = User;
  