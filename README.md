# TravelPlanner

A travel planning web application. Users organize everything about a trip in one place: trip basics, destinations, day-by-day activities, expenses and budget, notes, a packing checklist, and the ability to share a plan with others via QR code or link. Plans can be exported to PDF.

Built on the stack taught in the course: **React + Microsoft Service Fabric + ASP.NET Core + SQL Server (EF Core)**.

---

## Architecture overview

The system is split into a **frontend** (React) and a **backend** (Service Fabric microservices). The frontend talks **only** to the Gateway over REST; everything internal is Service Fabric Remoting.

```
React (frontend)
      │  HTTP / REST + JSON
      ▼
┌─────────────────────────────────────────────┐
│            Service Fabric Cluster            │
│                                              │
│  Gateway (Stateless, ASP.NET Core, Kestrel)  │  ← the only REST entry point
│    JWT auth · CORS · DTO mapping             │
│      │ Remoting                              │
│      ├──► AuthService     (Stateless)        │
│      ├──► TripService     (Stateless)        │
│      ├──► BudgetService   (Stateless)        │
│      ├──► DocumentService (Stateless)        │
│      └──► EventService    (Stateful)         │  ← ReliableQueue: audit + notifications
│                                              │
│  Common (class library: interfaces + DTOs)   │
│  DataAccess (EF Core DbContext + migrations) │
└─────────────────────────────────────────────┘
      │ EF Core
      ▼
SQL Server (TravelPlannerDB)
```

**Services**

| Service | Type | Responsibility |
|---------|------|----------------|
| Gateway | Stateless (ASP.NET Core API) | Single REST entry point. Validates JWT, applies CORS, maps DTOs, forwards to domain services via Remoting. |
| AuthService | Stateless (Remoting) | Registration, login, JWT issuing, password hashing (PBKDF2), share tokens, user administration. |
| TripService | Stateless (Remoting) | Trips, destinations, activities, checklist items. |
| BudgetService | Stateless (Remoting) | Expenses and budget calculation. |
| DocumentService | Stateless (Remoting) | PDF report and QR code generation. |
| EventService | Stateful (Remoting) | ReliableQueue-based event bus (audit logging + notifications), fire-and-forget. |
| Common | Class library | Remoting interfaces (`IService`), DTOs, event models, JWT settings. |
| DataAccess | Class library | EF Core `DbContext`, entities, migrations. Shared single database. |

---

## Tech stack

**Backend**
- Microsoft Service Fabric (stateless + stateful services)
- Service Fabric Remoting for internal service-to-service calls
- ASP.NET Core REST API (Gateway, self-hosted via Kestrel)
- Entity Framework Core + SQL Server
- JWT Bearer authentication, PBKDF2 password hashing
- QuestPDF (PDF), QRCoder (QR)

**Frontend**
- React + TypeScript (Vite)
- React Router
- Axios (in an injected service layer, JWT attached via interceptor)
- Context API for global auth state
- `useReducer` for complex form state

---

## Prerequisites

Install before running:

- **Visual Studio 2022** with the **Azure development** workload
- **Service Fabric SDK + Runtime** (local cluster)
- **Service Fabric Local Cluster** configured as **1 Node**
- **SQL Server Express** (instance `localhost\SQLEXPRESS`)
- **SQL Server Management Studio (SSMS)**
- **.NET 8 SDK**
- **Node.js** (v22 or current LTS) + npm

---

## Setup & running

### 1. Database

1. Open **SSMS** and connect to `localhost\SQLEXPRESS` using **Windows Authentication**.
2. Create a database named **`TravelPlannerDB`** (right-click *Databases* → *New Database*).
3. Grant the Service Fabric process account access to the database. In a new query window run:

   ```sql
   IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = 'NT AUTHORITY\NETWORK SERVICE')
       CREATE LOGIN [NT AUTHORITY\NETWORK SERVICE] FROM WINDOWS;
   GO
   USE TravelPlannerDB;
   GO
   IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = 'NT AUTHORITY\NETWORK SERVICE')
       CREATE USER [NT AUTHORITY\NETWORK SERVICE] FOR LOGIN [NT AUTHORITY\NETWORK SERVICE];
   GO
   ALTER ROLE db_datareader ADD MEMBER [NT AUTHORITY\NETWORK SERVICE];
   ALTER ROLE db_datawriter ADD MEMBER [NT AUTHORITY\NETWORK SERVICE];
   GO
   ```

   The Service Fabric services run as `NETWORK SERVICE` and connect with Windows Authentication, so this account needs read/write access.

### 2. Apply EF Core migrations

In Visual Studio, open the **Package Manager Console**, set the default project to **DataAccess**, and run:

```
Update-Database -StartupProject Gateway -Project DataAccess
```

This creates all tables and the `__EFMigrationsHistory` table in `TravelPlannerDB`.

### 3. Backend (Service Fabric)

1. Make sure the **Service Fabric Local Cluster** is **Started** (system tray → Manage Local Cluster).
2. Open the solution in **Visual Studio 2022 — run as Administrator** (required to deploy to the local cluster).
3. Set **TravelPlannerApp** as the startup project.
4. Press **F5** to build and deploy.
5. Verify in **Service Fabric Explorer** (`http://localhost:19080/Explorer`) that all 6 services are healthy (green).

The Gateway listens on **`http://localhost:8413`**. Swagger is available at `http://localhost:8413/swagger`.

> If the Gateway port differs in Service Fabric Explorer, update `VITE_API_BASE_URL` in the frontend `.env` accordingly.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app runs at **`http://localhost:5173`**.

The frontend reads the backend URL from `frontend/.env`:

```
VITE_API_BASE_URL=http://localhost:8413
```

---

## Creating an admin

All new accounts register with the **User** role. To make an account an admin:

1. Open **SSMS** → `TravelPlannerDB` → table **`Users`**.
2. Find the account and change its **`Role`** column from `0` (User) to `1` (Admin).
3. Log out and log back in so the new role is reflected in the issued JWT.

The admin then sees an **Admin Dashboard** button and can manage users (activate/deactivate, change role, reset password) and view all trips in the system.

---

## Project structure

```
TravelPlanner/
├── backend/
│   ├── TravelPlannerApp/        # Service Fabric application + services
│   │   ├── Gateway/             # REST API (the only public entry point)
│   │   ├── AuthService/
│   │   ├── TripService/
│   │   ├── BudgetService/
│   │   ├── DocumentService/
│   │   └── EventService/
│   ├── Common/                  # Remoting interfaces, DTOs, events
│   └── DataAccess/              # EF Core DbContext, entities, migrations
└── frontend/                    # React + Vite + TypeScript
    └── src/
        ├── api/                 # Axios instance + JWT interceptor
        ├── models/              # TypeScript types
        ├── services/            # API calls (injected into components)
        ├── context/             # AuthContext
        ├── components/          # Reusable UI + section components
        └── pages/               # Route-level views
```

---

## Key features

- User registration and login with hashed passwords (PBKDF2) and JWT (signature + expiry validated on every protected request)
- Two roles: **User** and **Admin**
- Trip CRUD with validation (start date not in the past, end date not before start, non-negative budget)
- Destinations, activities (grouped by day, status chips), expenses (auto-calculated budget summary), checklist, and notes — all validated to fall within the trip period
- Cascade delete: removing a trip removes all related entities
- Share a plan via QR code / link with **View** or **Edit** access levels (token validated on every request)
- PDF export of a trip plan
- Admin panel: user management and a system-wide trip overview
- Asynchronous event handling (audit + notifications) via a Service Fabric stateful ReliableQueue
