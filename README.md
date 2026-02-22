# 💊 AI Pharmacy Admin Panel

A complete, production-ready admin dashboard for AI Pharmacy built with React + Vite.

## ✨ Features

- **Dashboard** — Real-time stats, revenue charts, recent orders, refill alerts
- **Inventory** — Full CRUD for medicines, stock tracking, prescription flags
- **Orders** — Order management, status updates, detailed view
- **Deliveries** — Shipment tracking with visual progress indicators
- **Refill Alerts** — Stock alerts, patient notifications, auto-send
- **AI Agent Chat** — Chat with AI pharmacy assistant with intent detection
- **Settings** — Profile, notifications, security, API config

## 🚀 Quick Start

### Step 1: Create the project directory
```bash
mkdir pharmacy-admin && cd pharmacy-admin
```

### Step 2: Copy all source files (or clone repo)
> Place all the provided source files in the directory structure below.

### Step 3: Install dependencies
```bash
npm install
```

### Step 4: Start development server
```bash
npm run dev
```

App runs at: **http://localhost:3000**

---

## 📁 Project Structure

```
pharmacy-admin/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/
    │   └── AuthContext.jsx
    ├── components/
    │   ├── Layout.jsx
    │   ├── Sidebar.jsx
    │   └── Topbar.jsx
    ├── pages/
    │   ├── Login.jsx
    │   ├── Dashboard.jsx
    │   ├── Inventory.jsx
    │   ├── Orders.jsx
    │   ├── Deliveries.jsx
    │   ├── RefillAlerts.jsx
    │   ├── AgentChat.jsx
    │   └── Settings.jsx
    └── utils/
        └── api.js
```

---

## 🔗 Backend Integration

The app connects to your backend at `http://localhost:5000/api`.

All API calls are in `src/utils/api.js`. The app includes **mock data fallbacks** so the UI works even without the backend running.

### Test Login (when backend is running):
- Email: `admin@pharmacy.com`
- Password: `admin123`

### Demo Mode (no backend):
Just open the app — it will use mock data automatically. Navigate to any page and all functionality is demonstrated.

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| react-router-dom | Page routing |
| recharts | Dashboard charts |
| lucide-react | Icons |
| axios | API calls |
| react-hot-toast | Notifications |

---

## 🎨 Theme

Dark navy theme matching the original design:
- Primary Background: `#0f1117`
- Card Background: `#1c2333`
- Accent Green (brand): `#22c55e`
- Fonts: Syne (headings) + DM Sans (body)

## 🛠️ Build for Production

```bash
npm run build
npm run preview
```
