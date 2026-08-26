# Stitchx Plus LLC — Full-Stack E-Commerce Architecture

A modern full-stack e-commerce project foundation built with React 18, TypeScript, Vite, Tailwind CSS, Express, and Mongoose (MongoDB).

---

## 📁 Repository Structure

```
Stitchx Plus LLC/
├── client/              # React 18 + TypeScript + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Application route pages (HomePage, NotFoundPage)
│   │   ├── layouts/     # Root & sub layouts
│   │   ├── features/    # Feature-based domain modules
│   │   ├── hooks/       # Custom React hooks & TanStack Query hooks
│   │   ├── services/    # API integration services
│   │   ├── store/       # Zustand global client state
│   │   ├── schemas/     # Zod validation schemas
│   │   ├── types/       # Client TypeScript types
│   │   ├── utils/       # Utility functions (cn class merger)
│   │   └── constants/   # App configuration & constants
│   ├── .env.example
│   └── vite.config.ts
│
├── server/              # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/      # Environment (Zod validated) & Database configs
│   │   ├── controllers/ # HTTP request handlers
│   │   ├── services/    # Core business logic
│   │   ├── repositories/# Data access layer
│   │   ├── models/      # Mongoose MongoDB schemas & models
│   │   ├── routes/      # Express API routes (/health, /api/users, etc.)
│   │   ├── middlewares/ # Centralized error handler, request logger, Helmet, CORS
│   │   ├── utils/       # AppError class, Pino logger
│   │   ├── app.ts       # Express application instantiation
│   │   └── server.ts    # Application entrypoint & HTTP listener
│   └── .env.example
│
├── shared/              # Shared TypeScript types package (@stitchx/shared)
│   └── src/index.ts     # Common interfaces (HealthResponse, Product, User, etc.)
│
├── docker-compose.yml   # MongoDB container for development
├── package.json         # Workspace configuration & root scripts
└── README.md            # Setup & development guide
```

---

## 🛠️ Requirements & Tech Stack

- **Node.js**: `^20.0.0`
- **npm**: `^10.0.0`
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6, TanStack Query v5, Zustand, React Hook Form + Zod
- **Backend**: Node.js, Express, TypeScript, Mongoose (MongoDB), Pino HTTP Logger, Helmet, CORS
- **Database**: MongoDB (via Docker Compose or local instance)

---

## 🚀 Quick Start & Local Running Instructions

### 1. Install Dependencies

Run from the root directory to install all monorepo dependencies across `client`, `server`, and `shared`:

```bash
npm install
```

### 2. Environment Variables Setup

Both applications include `.env.example` templates. Create `.env` files for both server and client:

```bash
# Server environment file
cp server/.env.example server/.env

# Client environment file
cp client/.env.example client/.env
```

### 3. Start MongoDB (Optional for development)

If Docker is installed on your machine, start local MongoDB using Docker Compose:

```bash
docker-compose up -d
```

_(Note: The server is designed to start cleanly even if MongoDB is not active)._

### 4. Run Both Applications Concurrently

Run the root development command:

```bash
npm run dev
```

This will concurrently launch:

- 🌐 **Client Web App**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Server API**: [http://localhost:5000](http://localhost:5000)
- 🏥 **Server Health Endpoint**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 📜 Available Scripts

From the root directory:

| Command              | Action                                             |
| -------------------- | -------------------------------------------------- |
| `npm run dev`        | Runs both client & server dev servers concurrently |
| `npm run dev:client` | Runs client dev server only (Vite)                 |
| `npm run dev:server` | Runs server dev server only (tsx watch)            |
| `npm run build`      | Builds production bundles for all packages         |
| `npm run typecheck`  | Validates TypeScript types across all workspaces   |
| `npm run lint`       | Runs ESLint across client and server               |
| `npm run format`     | Formats code using Prettier                        |

---

## 🛡️ Security & Architecture Standards

- **Environment Isolation**: No real credentials or secrets committed. All configs managed via validated `.env` files.
- **Layered Architecture**: Express backend strictly separates `routes -> controllers -> services -> repositories -> models`.
- **Centralized Error Handling**: Unhandled exceptions caught gracefully with standardized HTTP response envelopes.
- **TypeScript Strict Mode**: Enabled across all packages for high code reliability.
- **CORS & Security**: Helmet active, CORS locked to `CLIENT_ORIGIN` (http://localhost:5173).
