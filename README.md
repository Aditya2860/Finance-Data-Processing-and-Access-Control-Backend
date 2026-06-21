# ApexLedger — Secure Role-Based Finance Platform

A professional, full-stack financial ledger and analytical tracking platform. It consists of a robust Node.js/Express API backend and a modern React/Vite single-page frontend application, fully integrated with Role-Based Access Control (RBAC).

---

## Suggested Names for your Resume
If you are listing this project on your resume, here are a few premium and professional names you can use:
1. **ApexLedger** (Reflects a peak-performance, enterprise-grade accounting sheet)
2. **ShieldLedger** (Highlights the core security, auth, and access control capabilities)
3. **FinRBAC Suite** (Emphasizes the technical implementation of Role-Based Access Control)
4. **OmniLedger** (Suggests comprehensive analytical and transactional tracking)

---

## Key Features

### Backend (Clean Layered Architecture)
- **Modular Structure**: Decoupled routes, controllers, services, database layers, and validators.
- **Authentication & Security**: Secure user registration and login utilizing JWT tokens and `bcrypt` password hashing.
- **Input Validation**: Zero-trust endpoint validation powered by `Zod` schemas.
- **Relational Ledger**: SQLite database with Prisma ORM mapping `User` to `Transaction` relations.
- **Active CORS Middleware**: Seamless integration allowing cross-origin requests from the decoupled frontend client.

### Frontend (Modern Glassmorphic Client)
- **Session Lifecycles**: Automatic session recovery via local storage token checks and backend verify handshakes.
- **Custom Interactive SVG Charts**: Dynamic, lightweight inline SVG components for tracking financial trends and category distributions, avoiding heavy, hard-to-maintain dependencies.
- **Advanced UI Styling**: Premium design system utilizing custom CSS variable tokens (HSL), glassmorphic elements (`backdrop-filter: blur`), hover transitions, and responsive tables.
- **Zero-Dependency Core**: Efficient, standard fetch wrapper with validation error parse-mapping.

---

## Role-Based Access Control (RBAC) Matrix

Access permissions are enforced on **both** the backend API endpoints and the frontend client UI:

| Feature / Action | VIEWER | ANALYST | ADMIN | Frontend UI Behavior |
| :--- | :---: | :---: | :---: | :--- |
| **View Ledger / Records** | ✅ | ✅ | ✅ | List transactions with searches and pagination. |
| **Create/Edit/Delete Records** | ❌ | ❌ | ✅ | Action buttons and Add Transaction modals are hidden for non-admins. |
| **Dashboard Metrics / Recent** | ✅ | ✅ | ✅ | Displays Total Income, Total Expense, Net Balance. |
| **Advanced Trends & Category Progress** | ❌ | ✅ | ✅ | Non-analysts see a permission lock screen placeholder. |
| **User Directory Administration** | ❌ | ❌ | ✅ | Nav tab is hidden; access block restricts the view entirely. |

---

## Project Structure
```
finance-backend/
├── prisma/             # SQLite migrations, seed data, and schema definitions
├── src/                # Backend API Core Source
│   ├── config/         # Centralized configuration
│   ├── constants/      # Global enums (Roles, Types)
│   ├── controllers/    # Express request-response handlers
│   ├── middleware/     # Auth, RBAC, logger, and error interceptors
│   ├── routes/         # Express endpoint definitions
│   ├── services/       # Core business logic and DB connectors
│   ├── utils/          # Standard response and error classes
│   └── validators/     # Zod payload structures
│
└── frontend/           # Frontend SPA Core Source (React + Vite)
    ├── src/
    │   ├── assets/     # Images and vector icons
    │   ├── components/ # View views (Auth, Dashboard, Ledger, Users)
    │   ├── services/   # Fetch API integrations
    │   ├── App.jsx     # Navigation, auth, and state coordinator
    │   └── index.css   # Custom CSS HSL design system tokens
    └── package.json
```

---

## Tech Stack
- **Runtime**: Node.js
- **Backend Framework**: Express.js
- **Database Engine**: SQLite via Prisma ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs
- **Validation**: Zod
- **Frontend SPA**: React with Vite
- **Styling**: Vanilla CSS (CSS Variables + HSL)
- **Runner**: Concurrently (multi-process runner)

---

## Setup & Local Execution

### 1. Installation
Clone the repository and install dependencies in the root project:
```bash
npm install
```

Install frontend client dependencies:
```bash
cd frontend
npm install
cd ..
```

### 2. Configure Environment
Create a `.env` configuration file in the root directory:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set to point to the local sqlite database:
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Run Database Migrations & Seeds
Generate the Prisma client and populate test user accounts:
```bash
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Running the Application
To run the backend server and the frontend client concurrently with hot reloading:
```bash
npm run dev:all
```
Once up, open:
- Frontend Client: `http://localhost:5173`
- Backend API Server: `http://localhost:3000/health`

### Seed Accounts for Quick Testing
Use these default credentials to test the RBAC capabilities on the login screen:
- **Admin**: `admin@example.com` / `password123`
- **Analyst**: `analyst@example.com` / `password123`
- **Viewer**: `viewer@example.com` / `password123`
