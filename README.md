# 🎮 CS2Squad

**CS2Squad** is a full-stack matchmaking web app that helps *Counter-Strike 2* players find teammates based on rank, preferences, and availability. Users log in via **Steam** to create a profile and start building their squad.

---

## ✨ Features

- 🔐 Steam authentication using `passport-steam`
- 🧠 Session management with `express-session` and secure cross-origin setup
- 🧩 Backend: Express.js with REST API
- ⚛️ Frontend: React (Vite) with TailwindCSS
- 💻 GitHub-friendly structure with environment variable support
- 🚧 Profile route implemented (`/profile`)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Steam Web API Key – [Get one here](https://steamcommunity.com/dev/apikey)

---

### 1. Clone the repo

```bash
git clone https://github.com/your-username/cs2squad.git
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
SESSION_SECRET=your_super_secret_session_key
STEAM_API_KEY=your_steam_api_key
STEAM_RETURN_URL=http://localhost:5000/auth/steam/return
STEAM_REALM=http://localhost:5000/
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

| Route                | Method | Description                          |
|---------------------|--------|--------------------------------------|
| `/auth/steam`        | GET    | Redirects to Steam login             |
| `/auth/steam/return` | GET    | Handles Steam callback & redirects   |
| `/profile`           | GET    | Returns user data (protected route)  |


## 🚀 Roadmap

- [x] Steam login integration
- [x] Profile route with session support
- [ ] Matchmaking filters (by rank, roles, etc.)
- [ ] Team invites & direct messages
- [ ] Deployment (Vercel + Render or Railway)


## 👤 Author

**Priitivi**  
💼 [Portfolio](https://www.priitivi.com)  
🐙 [GitHub](https://github.com/priitivi)  
🕹️ Passionate about games, code, and creative dev


## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](./LICENSE) file for details.

