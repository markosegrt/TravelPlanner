# System Architecture — TravelPlanner

This document describes the architecture of the TravelPlanner application: its components, how they communicate, the data model, and the key design decisions behind them.

---

## 1. High-level overview

TravelPlanner is split into two fully separate parts connected **only** through a REST API contract:

- **Frontend** — a React single-page application. It never touches the database directly; it talks only to the Gateway over HTTP/REST.
- **Backend** — a set of Microsoft Service Fabric microservices. Only the Gateway speaks HTTP; all internal communication uses Service Fabric Remoting (strongly-typed method calls).

```
React (frontend)
      │  HTTP / REST + JSON   (only the Gateway URL, read from .env)
      ▼
┌──────────────────────────────────────────────────────────┐
│                  Service Fabric Cluster                    │
│                                                            │
│   ┌──────────────┐  Remoting   ┌──────────────┐            │
│   │   Gateway     │────────────►│ AuthService  │──┐         │
│   │ (Stateless,   │             │ (Stateless)  │  │         │
│   │  ASP.NET Core)│  Remoting   ├──────────────┤  │         │
│   │  JWT · CORS   │────────────►│ TripService  │  ├──► SQL  │
│   │  DTO mapping  │             │ (Stateless)  │  │   Server│
│   │               │  Remoting   ├──────────────┤  │ (EF Core)
│   │               │────────────►│ BudgetService│──┘         │
│   │               │             │ (Stateless)  │            │
│   │               │  Remoting   ├──────────────┤            │
│   │               │────────────►│DocumentService│ (PDF+QR)  │
│   │               │             │ (Stateless)  │            │
│   │               │  Remoting   ├──────────────┤            │
│   │               │────────────►│ EventService │            │
│   └──────────────┘ (fire&forget)│ (STATEFUL)   │            │
│                                 │ ReliableQueue│            │
│                                 └──────────────┘            │
│                                                            │
│   Common.dll (interfaces + DTOs + events) — referenced by all
│   DataAccess.dll (EF Core DbContext + migrations)          │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Backend components

### 2.1 Gateway — Stateless, ASP.NET Core (API)
The single public entry point. It is the only service that speaks HTTP, self-hosted via Kestrel (no IIS). Responsibilities:
- Hosts the REST API consumed by the React app.
- Validates the JWT (signature + expiry) on every protected request.
- Applies the CORS policy for the React origin.
- Translates REST calls into Remoting calls to the domain services (via `ServiceProxy.Create` over the interfaces in `Common`).
- Maps between DTOs and requests; never exposes EF entities.

This is effectively a Backend-for-Frontend: it keeps the frontend unaware of the internal service layout, satisfying the rule that the frontend only knows a single backend URL.

### 2.2 AuthService — Stateless (Remoting)
- Registration, login, password hashing (PBKDF2) and verification.
- JWT issuing and validation.
- Share-token issuing and validation (View / Edit access levels).
- User administration used by the admin panel (list users, activate/deactivate, change role, reset password).
- Owns the `User` and `ShareToken` tables. Being stateless, all state lives in SQL Server, so recovery is immediate.

### 2.3 TripService — Stateless (Remoting)
- Core domain CRUD: trips, destinations, activities, checklist items.
- Server-side validation: start date not in the past (on creation), end date not before start, non-negative budget, and child dates (destinations, activities) within the trip period.
- Owns the `Trip`, `Destination`, `Activity`, `ChecklistItem` tables.
- Publishes audit/notification events to EventService (fire-and-forget).

### 2.4 BudgetService — Stateless (Remoting)
- Expense CRUD and budget computation (total spent, remaining) calculated server-side.
- Expense dates validated to fall within the trip period.
- Owns the `Expense` table.
- Separated from TripService because budget/expense is a distinct responsibility.

### 2.5 DocumentService — Stateless (Remoting)
- Generates the PDF trip report (QuestPDF) and the QR share image (QRCoder).
- Receives a fully composed DTO from the Gateway, so it has no database coupling — it is a pure rendering service.

### 2.6 EventService — Stateful (Remoting)
- The mandatory stateful service. Implements a lightweight event bus using a Service Fabric `ReliableQueue`.
- Exposes `PublishAsync` over Remoting; other services call it fire-and-forget.
- A background `RunAsync` loop dequeues events transactionally and dispatches them to two handlers: audit logging and notifications.
- If a handler throws, the transaction is not committed and Service Fabric re-queues the message — nothing is lost.
- Uses `HasPersistedState="true"`: messages are persisted to disk and replicated.

### 2.7 Common — Class library
Shared contracts referenced by every project:
- Remoting interfaces (`IAuthService`, `ITripService`, `IBudgetService`, `IDocumentService`, `IEventService`), each inheriting `IService`, with all methods returning `Task` / `Task<T>`.
- DTOs crossing the API boundary.
- Event models (`[DataContract]`).
- JWT settings shared between AuthService (issuing) and Gateway (validation).

### 2.8 DataAccess — Class library
- The EF Core `DbContext`, all entities, and migrations.
- A single shared database is used; this library is referenced by the services that own tables (Auth, Trip, Budget).
- Keeping it separate from `Common` keeps `Common` free of an EF Core dependency.

---

## 3. Communication

| From → To | Mechanism | Sync/Async |
|-----------|-----------|------------|
| React → Gateway | HTTP / REST + JSON | Sync |
| Gateway → Auth/Trip/Budget/Document | Remoting | Sync |
| Trip / Budget / Auth → EventService | Remoting (`PublishAsync`) | Async (fire & forget) |
| Services → SQL Server | EF Core | Sync |

All participating projects follow the Remoting checklist: the `Microsoft.ServiceFabric.Services.Remoting` package is installed everywhere, interfaces inherit `IService`, each `ServiceManifest.xml` declares an endpoint, and the proxy URI matches the service name in Service Fabric Explorer.

---

## 4. Data model

A single shared SQL Server database (`TravelPlannerDB`). EF entities stay internal; DTOs (in `Common`) cross the API boundary, with mapping in between.

**Entities and ownership**

- **AuthService:** `User`, `ShareToken`
- **TripService:** `Trip`, `Destination`, `Activity`, `ChecklistItem`
- **BudgetService:** `Expense`

**Relationships**

- `Trip` is the central entity, owned by a `User`.
- `Destination`, `Activity`, `ChecklistItem`, `Expense`, and `ShareToken` all reference a `Trip`.
- `Activity` may optionally reference a `Destination`.

**Cascade delete**

Deleting a trip removes all related entities (destinations, activities, checklist items, expenses, share tokens). This is handled by EF Core `OnDelete(DeleteBehavior.Cascade)` at the database level, which works across service boundaries because all services share one database.

---

## 5. Security

- **Passwords** are hashed with PBKDF2 (ASP.NET Core `PasswordHasher`) and stored hashed; the plain password is never persisted.
- **JWT** tokens are issued on login/registration. The Gateway validates signature and expiry on every protected request. The token carries the user id and role.
- **Roles:** `User` and `Admin`. Admin-only endpoints are protected with role-based authorization at the Gateway.
- **Share tokens** are opaque GUIDs with a View or Edit access level. The backend validates the token on every shared-plan request and decides whether an operation is allowed based on its type.
- **CORS** allows only the React origin; the CORS middleware runs before authorization.
- The token is always sent in the `Authorization` header, never in the URL.

---

## 6. Frontend architecture

- **Structure:** `api/` (Axios instance + JWT interceptor), `models/` (TypeScript types), `services/` (all HTTP calls, injected into components), `context/` (auth state), `components/`, `pages/`.
- **Service layer:** every HTTP call lives in a service module; components import service functions and never call Axios directly. The backend URL is read from `.env`.
- **State management:** Context API holds global auth state (token, user, role). Local component state uses `useState`; one multi-field form uses `useReducer` for clearer, centralized state transitions.
- **Auth flow:** the Axios request interceptor attaches the JWT from local storage; the response interceptor clears the session and redirects to login on a 401.
- **Routing:** React Router with a `ProtectedRoute` wrapper that guards authenticated routes and admin-only routes.
- **Validation:** controlled form components validate for UX (required fields, date ranges, non-negative amounts); the backend remains authoritative.

---

## 7. Key design decisions

- **Only the Gateway is an API.** All domain services are Remoting-only, which enforces the boundary that the frontend can only reach the backend through the Gateway and its single `.env` URL.
- **Single shared database** rather than database-per-service, which keeps the cross-service cascade delete trivial and stays within the scope of the course material.
- **DocumentService receives a composed DTO** instead of reading the database, keeping it a pure rendering service with no data coupling.
- **A separate `DataAccess` project** keeps `Common` limited to contracts and DTOs, free of an EF Core dependency.
- **Validation on both layers:** the frontend validates for user experience, the backend validates authoritatively inside each service that owns the data.
