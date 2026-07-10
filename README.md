# ADUN Hostel Management Portal

A real-time hostel allocation system for **Admiralty University of Nigeria**. Students can browse available rooms, inspect bed layouts, and reserve bed spaces — all live from Firestore.

---

## How the App Works

### Step 1: Log In

Open the app and choose a login method:

| Method | What to do |
|--------|-----------|
| **Quick Demo** | Click "Male Student" or "Female Student" for instant access |
| **Create Account** | Click "Sign Up", fill in your details (name, matric, gender, level, email, password) |
| **Already Registered** | Enter your email and password, then click "Sign In" |

---

### Step 2: Browse & Select a Room

After login you land on **Room Selection** — the main screen.

1. **Filter** by hostel block (A/B for male, C/D for female) and room type (2-Bed or 4-Bed)
2. **Click a room card** to open the details panel
3. **Pick a bed** (A, B, C, or D) — green means available, grey means taken
4. Click **Reserve Bed** to lock it

> A reservation locks the bed for **5 minutes**. Complete payment before the timer runs out or the bed is released.

---

### Step 3: Submit Payment

After reserving, you are automatically taken to **Payments**.

| Fee | Amount |
|-----|--------|
| Accommodation | NGN 85,000 |
| Utility & Maintenance Levy | NGN 12,000 |
| Caution Deposit (refundable) | NGN 10,000 |
| Portal Service Charge | NGN 3,000 |
| **Total** | **NGN 110,000** |

**Payment steps:**

1. Generate your invoice from the portal
2. Pay at any designated bank
3. Upload your proof of payment (image or PDF) on the Payments screen
4. Wait for confirmation within 24 hours

---

### Step 4: Track Your Booking

Go to **My Booking** from the sidebar or top tabs to see your current status:

| Status | Meaning |
|--------|---------|
| **Reserved** | Bed locked, awaiting payment proof |
| **Payment Under Review** | Proof submitted, admin is verifying |
| **Confirmed** | Allocation complete |
| **Reservation Expired** | Time ran out — go back to Room Selection to pick again |

---

## Navigating the App

### Top Tabs (always visible)

| Tab | Screen |
|-----|--------|
| **Dashboard** | Welcome page with your status, eligibility, and current allocation summary |
| **Room Selection** | Browse and reserve rooms (default after login) |
| **My Booking** | View your active booking and status |
| **Payments** | Upload payment proof and view fee breakdown |

### Sidebar (left panel)

| Item | What it does |
|------|-------------|
| **Dashboard** | Overview of your account and allocation |
| **Room Selection** | Browse available rooms |
| **My Booking** | Current booking status |
| **Payments** | Payment details and upload |
| **Hostel Map** | Visual layout of all 4 hostel blocks with floor plans |
| **Maintenance** | Report a maintenance issue (plumbing, electrical, etc.) |
| **Profile** | View your account details (name, matric, level, eligibility) |
| **Seed Data** | *(Admin/Dev)* Populate Firestore with sample rooms and users |
| **Logout** | Sign out of the portal |

---

## Hostel Layout

| Block | Gender | Floors | Room Types |
|-------|--------|--------|-----------|
| **Block A** | Male | 5 | 2-Bed (Floor 1), 4-Bed (Floors 2-5) |
| **Block B** | Male | 5 | 2-Bed (Floor 1), 4-Bed (Floors 2-5) |
| **Block C** | Female | 5 | 2-Bed (Floor 1), 4-Bed (Floors 2-5) |
| **Block D** | Female | 5 | 2-Bed (Floor 1), 4-Bed (Floors 2-5) |

Room numbering: `{Wing}{Floor}{Room}` — e.g. `A1-101` (Wing A1, Floor 1, Room 01)

---

## Rules & Limits

- **3 reservations per 24 hours** — exceeding this blocks your account for 24 hours
- **5-minute lock** — each reservation expires if payment isn't submitted in time
- **Eligibility required** — fees must be paid before you can reserve
- **400-level students** get priority access before other levels

---

## For Developers

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite 8 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Backend | Firebase Firestore (real-time) |
| Auth | Firebase Auth (email/password) |
| Deploy | GitHub Actions to GitHub Pages |

### Setup

```bash
cd frontend
npm install
npm run dev
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and deploy to GitHub Pages |

### Project Structure

```
frontend/src/
├── components/
│   ├── auth/           LoginPage.jsx
│   ├── layout/         AppLayout, Sidebar, TopBar
│   ├── booking/        BookingDashboard, RoomGrid, RoomCard, RoomDetails, MyBooking, Payments
│   ├── dashboard/      DashboardHome, HostelMap, Maintenance, Profile
│   └── common/         SeedDataPanel
├── services/           firestore.js (all Firebase operations)
├── utils/              seedData.js (Firestore seeding)
├── App.jsx             Auth routing
└── main.jsx            Entry point
```

### Deployment

Pushes to `main` trigger GitHub Actions → builds Vite → deploys to GitHub Pages.

**Settings required:** Go to **Settings → Pages → Source** and select **GitHub Actions**.

Live at: `https://soldierofgod-8.github.io/Hostel_Allocation/`

### Design Tokens

| Token | Value |
|-------|-------|
| Primary | `#00113a` (Deep Navy) |
| Secondary | `#775a19` (Gold) |
| Background | `#faf8ff` |
| Success | `#1B5E20` |
| Warning | `#F57F17` |
| Error | `#B71C1C` |
| Display Font | Hanken Grotesk |
| Body Font | Inter |
| Label Font | JetBrains Mono |
