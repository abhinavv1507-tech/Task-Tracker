# TaskFlow — MERN Task Manager

A production-ready, full-stack task management application built with the MERN stack. Features a premium **Ink Wash** design system (Charcoal · Cool Gray · Soft Ivory), real-time filtering, server-side pagination, and a fully layered backend architecture.

---

## 📸 Preview

> Dashboard with stats, completion rate, and task cards styled in the Ink Wash palette.

---

## ✨ Features

### Task Management
- ✅ **Create, Edit, Delete** tasks via a modal form
- ↩️ **Undo Delete** — a 5-second toast notification lets you reverse an accidental deletion
- 📦 **Archive & Restore** — move tasks out of your active view without deleting them
- 🏷️ **Tag System** — attach multiple free-form tags to any task

### Organization
- 🗂️ **Status** — `Todo`, `In Progress`, `Done` (done tasks render with strikethrough)
- 🔴 **Priority** — `Urgent`, `High`, `Medium`, `Low` (color-coded left border on cards)
- 📁 **Category** — `Work`, `Personal`, `Health`, `Finance`, `Education`, `Other`
- 📅 **Due Dates** — overdue tasks highlighted in red, due-today tasks called out separately

### Browsing & Filtering
- 🔍 **Debounced search** — instant search with 350ms debounce, no extra API calls
- 🎛️ **Filter Panel** — single "Filters" button opens a 3-column slide-down panel (Status / Priority / Category)
- 🔢 **Active Filter Badge** — shows count of active filters on the button
- 🔼 **Sort** — Newest First, Oldest First, Due Date (Asc/Desc), Title (A–Z / Z–A)
- 📄 **Server-side Pagination** — 9 tasks per page, MongoDB `skip/limit`, page buttons auto-scroll to top

### Dashboard
- 📊 **Stats Cards** — Total, Done, Overdue, Due Today counts from MongoDB aggregation
- 📈 **Completion Rate Progress Bar** — animated, live percentage
- 📋 **Due Today** section and **Recent Tasks** grid

### UX & Accessibility
- ⌨️ **Keyboard Shortcuts** — `Ctrl/Cmd + F` focuses search, `Ctrl/Cmd + D` goes to Dashboard
- 💀 **Skeleton Loaders** — shimmer placeholders during API calls
- 🔔 **Toast Notifications** — success/error/undo feedback via `react-hot-toast`
- 🎨 **Grid / List view toggle** on All Tasks page

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI library |
| Vite | Build tool & dev server |
| React Router v6 | Client-side routing |
| React Context + useReducer | Global state management |
| Axios | HTTP client |
| date-fns | Date formatting & comparison |
| react-icons (Feather) | Icon set |
| react-hot-toast | Toast notifications |
| Vanilla CSS | Design system (no Tailwind) |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Mongoose | MongoDB ODM |
| MongoDB Atlas | Cloud database |
| express-validator | Request validation |
| express-rate-limit | API rate limiting |
| cors | Cross-origin policy |
| helmet | HTTP security headers |
| morgan | HTTP request logging |
| dotenv | Environment variables |
| nodemon | Dev auto-restart |

---

## 🏗️ Project Architecture

```
mern-task-tracker/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── api/                # Axios instance + task API methods
│       ├── components/
│       │   ├── layout/         # Sidebar, Layout wrapper
│       │   ├── tasks/          # TaskCard, TaskForm
│       │   └── ui/             # Badge, Modal, Skeleton, EmptyState
│       ├── constants/          # Enums, labels, default filters
│       ├── context/            # TaskContext (useReducer global state)
│       ├── hooks/              # useKeyboardShortcuts
│       ├── pages/              # Dashboard, AllTasks, Archived, NotFound
│       └── index.css           # Full design system (1200+ lines)
│
└── server/                     # Express backend
    └── src/
        ├── config/             # MongoDB connection
        ├── constants/          # Enums, pagination defaults
        ├── controllers/        # HTTP layer — reads req, sends res
        ├── services/           # Business logic layer
        ├── repositories/       # MongoDB query layer (all Mongoose code)
        ├── models/             # Mongoose schemas
        ├── routes/             # Express route definitions
        ├── middleware/         # Error handler, rate limiter
        ├── validators/         # express-validator rule sets
        └── utils/              # ApiResponse, ApiError helpers
```

### Backend Request Lifecycle

```
HTTP Request
     ↓
Rate Limiter → CORS → Helmet → Morgan (logging)
     ↓
Express Router (routes/)
     ↓
Validator Middleware (express-validator)
     ↓
Controller (reads req.query / req.body / req.params)
     ↓
Service (business logic — e.g. "can this task be archived?")
     ↓
Repository (Mongoose query — find / findOne / aggregate)
     ↓
MongoDB Atlas
     ↓
Repository → Service → Controller → ApiResponse JSON
     ↓
Frontend (Axios) → Context dispatch → UI re-renders
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free tier works)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/mern-task-tracker.git
cd mern-task-tracker
```

### 2. Install all dependencies

```bash
npm run install:all
```

This installs packages for the root, `server/`, and `client/` in one command.

### 3. Configure environment variables

**Server** — create `server/.env`:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/task-tracker
CORS_ORIGIN=http://localhost:5174
```

**Client** — create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

> **Note:** If your ISP blocks MongoDB SRV DNS lookups (you see `querySrv ECONNREFUSED`), replace the `+srv` URI with a direct connection string listing each shard host explicitly.

### 4. Start both servers

```bash
npm run dev
```

This uses `concurrently` to launch both the Express server (`:5000`) and the Vite dev server (`:5174`) in one terminal.

Or run them separately:
```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

### 5. Seed sample data (optional)

With both servers running, seed 20 realistic tasks:
```bash
node server/scripts/seed.js
```

---

## 📡 API Reference

Base URL: `http://localhost:5000/api/v1`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/tasks` | List tasks (filterable, searchable, sortable, paginated) |
| `POST` | `/tasks` | Create a new task |
| `GET` | `/tasks/stats` | Dashboard aggregation stats |
| `GET` | `/tasks/:id` | Get a single task |
| `PATCH` | `/tasks/:id` | Update a task (partial) |
| `DELETE` | `/tasks/:id` | Soft-delete a task |
| `PATCH` | `/tasks/:id/restore` | Restore a soft-deleted task |
| `PATCH` | `/tasks/:id/archive` | Archive a task |
| `PATCH` | `/tasks/:id/unarchive` | Restore from archive |
| `GET` | `/healthcheck` | Server health check |

### GET /tasks — Query Parameters

| Param | Type | Example | Description |
|---|---|---|---|
| `page` | number | `2` | Page number (default: 1) |
| `limit` | number | `9` | Items per page (max: 50) |
| `sort` | string | `-createdAt` | Field to sort by (prefix `-` for descending) |
| `status` | string | `in-progress` | Filter by status |
| `priority` | string | `urgent` | Filter by priority |
| `category` | string | `work` | Filter by category |
| `search` | string | `deploy` | Full-text search on title/description |
| `isArchived` | boolean | `false` | Show archived tasks |

### Response Shape

All responses follow a consistent envelope:
```json
{
  "success": true,
  "message": "Tasks fetched successfully",
  "data": {
    "tasks": [...],
    "pagination": {
      "currentPage": 2,
      "totalPages": 3,
      "totalCount": 21,
      "limit": 9,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

---

## 🎨 Design System

The UI uses a custom **Ink Wash** palette — gallery-like, high contrast, zero blues or purples.

| Token | Value | Usage |
|---|---|---|
| `--bg-base` | `#111111` | Page background |
| `--bg-surface` | `#1C1C1C` | Cards |
| `--bg-elevated` | `#242424` | Modals, dropdowns |
| `--ivory` | `#F0EBE1` | Primary text, CTA buttons |
| `--ivory-muted` | `#C4BEB5` | Secondary text |
| `--text-disabled` | `#5A5A5A` | Placeholders, disabled |
| `--status-urgent` | `#C0453A` | Urgent priority |
| `--status-high` | `#B8873A` | High priority |
| `--status-medium` | `#4A8A6A` | Medium priority |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl/Cmd + F` | Focus the search bar on All Tasks |
| `Ctrl/Cmd + D` | Navigate to Dashboard |

---

## 📁 Task Data Model

```js
{
  title:       String,   // required, 1–200 chars
  description: String,   // optional, max 2000 chars
  status:      String,   // 'todo' | 'in-progress' | 'done'
  priority:    String,   // 'low' | 'medium' | 'high' | 'urgent'
  category:    String,   // 'work' | 'personal' | 'health' | 'finance' | 'education' | 'other'
  tags:        [String], // array, max 10 tags, each max 30 chars
  dueDate:     Date,     // optional
  isArchived:  Boolean,  // default false
  deletedAt:   Date,     // null = active; Date = soft-deleted (enables Undo)
  completedAt: Date,     // set automatically when status → 'done'
  createdAt:   Date,     // auto (Mongoose timestamps)
  updatedAt:   Date,     // auto (Mongoose timestamps)
}
```

---

## 🗂️ Available Scripts

From the **root** directory:

| Command | Description |
|---|---|
| `npm run dev` | Start both servers concurrently |
| `npm run dev:server` | Start Express server only |
| `npm run dev:client` | Start Vite dev server only |
| `npm run install:all` | Install all dependencies (root + server + client) |

---

## 🔒 Security

- **Helmet** sets secure HTTP headers on every response
- **CORS** is scoped to the frontend origin only (via `CORS_ORIGIN` env var)
- **Rate limiting** — 100 requests per 15 minutes per IP on the API
- **Input validation** via `express-validator` on all write endpoints
- **Soft deletes** — data is never truly destroyed; `deletedAt` timestamp gates visibility
- **MAX_PAGE_SIZE = 50** — prevents clients from requesting unbounded result sets

---

## 🛣️ Roadmap

- [ ] Google OAuth login / signup
- [ ] Per-user task scoping
- [ ] Monthly task report (aggregated by category & status)
- [ ] Email reminders for overdue tasks
