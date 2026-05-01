# Collaborative Team Hub

A full-stack web application where teams can manage shared goals, post announcements, and track action items in real time. Built as a monorepo with separate frontend and backend, deployed on Railway.

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | Turborepo |
| Frontend | Next.js 16 — App Router, JavaScript (no TypeScript) |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Backend | Node.js + Express.js (REST API) |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT — access + refresh tokens in httpOnly cookies |
| Real-time | Socket.io |
| File Storage | Cloudinary (avatars & attachments) |
| Deployment | Railway — frontend & backend as separate services |

## Features

### Authentication
- Email/password register & login
- Protected routes — dashboard accessible only after login
- User profile with avatar upload (Cloudinary)
- Logout and token refresh

### Workspaces
- Create and switch between multiple workspaces
- Invite members by email; assign roles (Admin / Member)
- Each workspace has a name, description, and accent colour

### Goals & Milestones
- Create goals with title, owner, due date, and status
- Nest milestones under goals with a progress percentage
- Post progress updates on a goal's activity feed

### Announcements
- Admins publish rich-text announcements workspace-wide
- Team members can react (emoji) and comment
- Pin important announcements to the top of the feed

### Action Items
- Create action items with assignee, priority, due date, and status
- Link action items to a parent goal
- Kanban board and list view toggle

### Real-time & Activity
- Socket.io pushes new posts, reactions, and status changes live
- Show which members are currently online in the workspace
- @Mention teammates in comments — triggers an in-app notification

### Analytics
- Dashboard stats: total goals, items completed this week, overdue count
- Goal completion chart (Recharts)
- Export workspace data as CSV

## Advanced Features (chosen 2 of 5)

### 1. Optimistic UI
Actions reflect instantly before server confirmation; roll back gracefully on error. Implemented in the goals and action items stores.

### 2. Advanced RBAC
Permission matrix controlling who can create goals, post announcements, and invite members. Admins have full control; Members have read/write for goals and actions, read-only for workspace settings.

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudinary account (for file uploads)

### Setup

```bash
# 1. Clone the repo
git clone <repo-url>
cd collaborative-team-hub

# 2. Install root dependencies
npm install

# 3. Install API dependencies
cd apps/api
npm install

# 4. Install Web dependencies
cd ../web
npm install

# 5. Configure environment variables
# Edit apps/api/.env with your database URL, JWT secrets, and Cloudinary credentials
# Edit apps/web/.env.local with your API and Socket URLs

# 6. Set up the database
cd ../api
npx prisma generate
npx prisma db push

# 7. Start development (from root)
cd ../..
npm run dev
```

### Environment Variables

#### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:3000
PORT=4000
```

#### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_SOCKET_URL=http://localhost:4000
```

## Deployment (Railway)

1. Create a new Railway project
2. Provision a PostgreSQL database via Railway's plugin — it injects `DATABASE_URL` automatically
3. Deploy **Backend** as a service from `apps/api`:
   - Set all environment variables in Railway's variable panel
   - Build command: `npm install && npx prisma generate && npx prisma db push`
   - Start command: `node src/index.js`
4. Deploy **Frontend** as a separate service from `apps/web`:
   - Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SOCKET_URL` to the backend URL
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

## Project Structure

```
collaborative-team-hub/
├── apps/
│   ├── api/                  # Express.js REST API
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── src/
│   │       ├── controllers/  # Route handlers
│   │       ├── lib/          # Prisma, Cloudinary, Socket.io
│   │       ├── middleware/   # Auth & RBAC middleware
│   │       ├── routes/       # Express routers
│   │       ├── utils/        # JWT helpers
│   │       └── index.js      # Entry point
│   └── web/                  # Next.js frontend
│       ├── app/              # App Router pages
│       │   ├── dashboard/    # Protected dashboard routes
│       │   ├── login/
│       │   └── register/
│       ├── components/       # Reusable components
│       ├── lib/              # API client (Axios)
│       └── store/            # Zustand stores
├── packages/                 # Shared packages (future)
├── turbo.json               # Turborepo config
└── package.json             # Root workspace config
```

## License
ISC
