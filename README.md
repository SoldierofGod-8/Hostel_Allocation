# 🏛️ ADUN Hostel Management Portal

A real-time hostel allocation system for **Admiralty University of Nigeria**. Students can browse available rooms by gender block, inspect bed layouts, and reserve bed spaces — all live from Firestore.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 3 (ADUN design system) |
| **Icons** | Lucide React |
| **Backend** | Firebase Firestore (real-time) |
| **Auth** | Firebase Auth (email/password) |
| **Fonts** | Hanken Grotesk, Inter, JetBrains Mono |
| **Deploy** | GitHub Actions → GitHub Pages |

---

## Project Structure

```
frontend/
├── public/
│   └── 404.html              # SPA fallback for GitHub Pages
└── src/
    ├── components/
    │   ├── auth/
    │   │   └── LoginPage.jsx       # Dual-entry login (Male/Female + admin)
    │   ├── layout/
    │   │   ├── AppLayout.jsx       # Shell: Sidebar + TopBar + content
    │   │   ├── Sidebar.jsx         # Fixed left navigation
    │   │   └── TopBar.jsx          # Top navigation tabs + user avatar
    │   ├── booking/
    │   │   ├── BookingDashboard.jsx # Main booking view (orchestrator)
    │   │   ├── ProgressStepper.jsx  # 4-step application tracker
    │   │   ├── FiltersPanel.jsx     # Block/room-type filters + legend
    │   │   ├── RoomGrid.jsx         # Responsive room card grid
    │   │   ├── RoomCard.jsx         # Individual room with status
    │   │   └── RoomDetails.jsx      # Bed slots panel + reserve button
    │   └── common/                  # Shared UI primitives
    ├── hooks/                       # Custom React hooks
    ├── services/
    │   └── firestore.js             # All Firebase read/write operations
    ├── utils/
    │   └── seedData.js              # Firestore seeding utility
    ├── firebaseConfig.js
    ├── mockAuth.js
    ├── App.jsx                      # Auth routing (login ↔ dashboard)
    ├── index.css                    # Tailwind + fonts + scrollbar
    └── main.jsx                     # React entry point
```

---

## Getting Started

```bash
# Install dependencies
cd frontend
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Seeding Sample Data

1. Log in using the **Male Student** or **Female Student** demo button
2. Click the **Seed Data** button in the top-right of the dashboard
3. Wait for confirmation — rooms, beds, and mock student profiles are written to Firestore

---

## Deployment

The repo uses **GitHub Actions** for automatic deployment. Every push to `main`:

1. Installs dependencies
2. Builds the Vite app (`frontend/dist/`)
3. Deploys to **GitHub Pages**

### Required Settings

1. Go to **Settings → Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**
3. The site will be available at:

```
https://soldierofgod-8.github.io/Hostel_Allocation/
```

> A `404.html` fallback is included in `public/` to handle client-side routing on GitHub Pages.

---

## Design System

Built on a **Corporate / Modern** aesthetic for Admiralty University of Nigeria:

| Token | Value |
|-------|-------|
| **Primary** | `#00113a` (Deep Navy) |
| **Secondary** | `#775a19` (Gold) |
| **Background** | `#faf8ff` |
| **Success** | `#1B5E20` |
| **Warning** | `#F57F17` |
| **Error** | `#B71C1C` |
| **Font (Display)** | Hanken Grotesk |
| **Font (Body)** | Inter |
| **Font (Labels)** | JetBrains Mono |
