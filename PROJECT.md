# CS2Squad - Project Specification

**Tagline:**  
*Find the perfect CS2 teammates by rank, region, and playstyle.*

---

## 🎯 Overview

CS2Squad is a full-stack web application that helps Counter-Strike 2 players connect with teammates based on skill level, preferred roles, region, and availability. The platform aims to make party finding seamless and effective — reducing the time spent in solo queue and increasing team synergy.

---

## 🛠 Tech Stack

### Frontend
- React
- TailwindCSS
- React Router
- Axios

### Backend
- Node.js + Express
- MongoDB (via Mongoose)
- Passport.js (Steam OAuth)
- Steam Web API

### Dev Tools & Hosting
- GitHub Projects (Task Management)
- Postman (API Testing)
- Vercel (Frontend)
- Render / Railway / Heroku (Backend)
- GitHub Actions (CI - optional)
- Figma (Designs/Wireframes)

---

## 📦 Features

### MVP
- [ ] User registration and login (via Steam)
- [ ] Link Steam account + fetch profile info
- [ ] Manual or automatic CS2 rank entry
- [ ] User profile setup: Rank, Region, Role, Availability
- [ ] Search & filter players by criteria
- [ ] “Invite to party” or “Add friend” button

### Stretch Goals
- [ ] Live chat or message requests
- [ ] Match history sync (via API or manual input)
- [ ] Discord integration
- [ ] User ratings or reputation system
- [ ] Team creation and management (for 5-stacks)

---

## 🗂 Project Structure

CS2Squad/
│
├── client/         # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/         # Images, icons, etc.
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level pages
│   │   ├── services/       # API calls (e.g. axios setup)
│   │   ├── hooks/          # Custom hooks (if needed)
│   │   ├── context/        # Global state (if using Context API or Zustand)
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── tailwind.config.js
│
├── server/         # Node.js backend
│   ├── config/         # DB config, API keys, etc.
│   ├── controllers/    # Functions that handle logic
│   ├── middleware/     # Auth, error handlers, etc.
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API routes
│   ├── services/       # External APIs (e.g. Steam)
│   ├── utils/          # Utility functions
│   ├── app.js          # Main Express app
│   └── server.js       # Server entry point
│
├── .gitignore
├── LICENSE
├── README.md
├── PROJECT.md
└── package.json       # (or two separate ones in client/ and server/)

---

## 📌 Milestones

- [ ] ✅ Initial project setup
- [ ] ✅ Add `PROJECT.md` and planning
- [ ] 🔧 Steam OAuth research + setup
- [ ] 🧪 Build authentication & user model
- [ ] 🎨 Basic frontend wireframes (Figma or paper)
- [ ] 📬 API routes for profiles + filters
- [ ] 🚀 MVP deployment

---

## 📘 Documentation & Conventions

- Follow **conventional commits** (`feat:`, `fix:`, `refactor:`)
- Keep branches descriptive (`feature/auth-steam`, `bug/fix-login`)
- Write clear, descriptive PRs and issues
- Update README and `PROJECT.md` with any structural changes
- Keep code DRY and modular

---

## 🧠 Notes

- CS2 rank data via Steam may be limited — fallback to manual input
- Consider caching Steam data to reduce API calls
- Prioritise clean code, responsiveness, and accessibility
