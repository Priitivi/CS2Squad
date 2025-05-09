# 🎮 CS2Squad

**CS2Squad** is a full-stack matchmaking web app that helps *Counter-Strike 2* players find teammates based on rank, preferences, and availability. Users log in via **Steam** to create a profile and start building their squad.

---

## ✨ Live Demo

-🌐 Frontend: https://www.cs2squad.com
- 🔗 API: https://api.cs2squad.com



---

## 🚀 Features

- 🔐 Steam Authentication: Secure login using Steam OpenID with JWT-based sessions.
- 👤 Profile Management:
  - Steam avatar, username, Premier rank, region & availability.
  - Edit profile in a sleek modal with custom CS2-style Premier Rank slider.
- 🛠️ Teams:
  - Create & manage teams.
  - Add or Remove teamates.
  - Rename & delete teams.
- 🔄 Live Updates: Frontend + backend communicate smoothly using JWT for protected routes.
- 🎨 Sleek, animated homepage with testimonials, stats, feature cards, and call-to-action
- 🎮 Theming inspired by Counter-Strike 2 with silhouettes and gamery vibe

---

## 🛠️ Tech Stack

- **Frontend:** React + TailwindCSS + React Router
- **Backend:** Node.js + Express + Passport-Steam (OpenID) + JWT Auth
- **Auth:** Steam OpenID
- **Styling:** TailwindCSS with animations and responsive design

---

## Hosting
- 🌐 Frontend: Vercel
- 🖥️ Backend: Railway
- 🛢️ Database: Railway Postgres (Docker)



---

## 🔧 Planned Features

- 🧠 Matchmaking algorithm based on region + rank
- 📈 Leaderboard and stats
- 💻 Admin dashboard

---

## 💡 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Steam Web API Key – [Get one here](https://steamcommunity.com/dev/apikey)

---

### 1. Clone the repo

```bash
git clone https://github.com/priitivi/cs2squad.git
cd cs2squad
```

### 2 Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in `/server` with the following

```ini
PORT=5000
STEAM_API_KEY=your_steam_api_key
STEAM_RETURN_URL=https://api.cs2squad.com/auth/steam/return
STEAM_REALM=https://api.cs2squad.com/
JWT_SECRET=your_jwt_secret
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
DB_PORT=your_db_port
DATABASE_URL=your_full_postgres_connection_string
```

Start the backend
```bash
node server.js
```

---
### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🔁 API Routes

| Route                                                       | Method | Description                                                  |
|-------------------------------------------------------------|--------|--------------------------------------------------------------|
| `/auth/steam`                                               | GET    | Redirects the user to Steam login                             |
| `/auth/steam/return`                                        | GET    | Handles Steam callback and redirects with JWT token           |
| `/profile`                                                  | GET    | Returns logged-in user data (JWT-protected via JWT in header) |
| `/team/:steamId/create-team`                                | POST   | Create a new team (provide `name` & optional `members`)       |
| `/team/:steamId/:teamName/add-teammate`                     | POST   | Add a teammate to a team (provide `teammateId`)               |
| `/team/:steamId/:teamName/remove-teammate`                  | POST   | Remove a teammate from a team (provide `teammateId`)          |
| `/team/:steamId/:teamIndex`                                 | DELETE | Delete a team by its index                                    |
| `/team/:steamId/:teamIndex/rename`                          | POST   | Rename a team (provide `newName`)                             |



## 🗺️ Roadmap

- ✅ Full Steam login + JWT token system
- ✅ Profile + Team creation & management
- ✅ Responsive design & full deployment (Vercel + Railway)
- 🔜 Matchmaking filters (rank, region)
- 🔜 Team invites & recommendations
- 🔜 Leaderboard & player stats
- 🔜 Admin dashboard

## 👤 Author

**Priitivi**  
💼 [Portfolio](https://www.priitivi.com)  
🐙 [GitHub](https://github.com/priitivi)  
🕹️ Passionate about games, code, and creative dev


## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

