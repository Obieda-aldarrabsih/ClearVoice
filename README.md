# ClearVoice E-Invoicing Compliance Gateway

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![.NET 8](https://img.shields.io/badge/.NET-8.0-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

ClearVoice is an institutional-grade B2B e-invoicing compliance gateway designed to bridge Enterprise Resource Planning (ERP) systems with national tax clearance authorities, specifically tailored for the Jordanian e-invoicing compliance model.

---

## Architecture & Clean Architecture Principles

The system follows a strict **Clean Architecture** approach with **CQRS** (Command Query Responsibility Segregation) principles to ensure high maintainability, testability, and decoupled business logic:

1. **`ClearVoice.Domain`**: Core enterprise models and entities (`Tenant`, `Invoice`, `User`, `OutboxMessage`, `WebhookSubscription`), along with domain exceptions. Has zero external dependencies.
2. **`ClearVoice.Application`**: Use-case orchestration using **MediatR** for CQRS command/query segregation. Request validation is handled using **FluentValidation** pipeline behaviors before handlers execute.
3. **`ClearVoice.Infrastructure`**: Persistence and external interfaces:
   - **PostgreSQL & EF Core**: Relational persistence and schema migrations.
   - **Multi-Tenant Data Isolation**: Automated EF Core Global Query Filters (`CurrentTenantId`), ensuring tenant data isolation at the ORM query level.
   - **Clearance Service**: Contract interface `IClearanceClient` (currently implemented with `MockClearanceClient` for local simulation).
4. **`ClearVoice.Api`**: RESTful presentation layer (ASP.NET Core 8 Web API) using JWT bearer tokens and machine-to-machine API keys.
5. **`ClearVoice.Workers`**: Dedicated background service implementing the Transactional Outbox pattern for asynchronous clearance submission and webhook retries.
6. **`frontend/`**: Multilingual Single Page Application (React 18 + Vite + TypeScript + Tailwind CSS).

---

## Key Engineering Decisions

### 1. Multi-Tenancy & Data Isolation
Security in multi-tenant SaaS is paramount. Data isolation is enforced via **EF Core Global Query Filters**. An injected `ITenantProvider` extracts the tenant ID from authenticated JWT claims or API key headers, appending `WHERE TenantId = @id` to every query automatically to eliminate tenant leakage.

### 2. Password Security (Argon2id)
User password hashing uses **Argon2id** (via `Konscious.Security.Cryptography`), the OWASP-recommended algorithm offering superior resistance to GPU cracking and side-channel attacks compared to legacy PBKDF2 or standard BCrypt.

### 3. API Key Authentication for Machine-to-Machine (ERP) Integration
While web users authenticate via short-lived JWT tokens, ERP integrations utilize long-lived API keys. The system returns the plain-text key only once upon generation and persists an irreversible **SHA-256 hash** in the database, ensuring keys cannot be retrieved if the database is read.

### 4. Transactional Outbox Pattern & Background Workers
Submitting invoices to external services over HTTP introduces network failure risks. `SubmitInvoiceCommandHandler` persists the `Invoice` and an associated `OutboxMessage` in a single atomic database transaction. The background worker (`ClearVoice.Workers`) polls pending messages and executes clearance with resilient backoff retry.

### 5. HMAC-Signed Webhook Notifications
When an invoice status transitions (e.g. Cleared or Rejected by the national clearance service), the system dispatches an HTTP POST webhook containing an HMAC-SHA256 signature header (`X-ClearVoice-Signature`) so subscribers can verify message authenticity.

### 6. Modern Multilingual Frontend
The web portal supports Arabic (RTL) and English (LTR) using `i18next`:
- **Styling**: Tailwind CSS with custom design tokens for institutional compliance software.
- **Interactions**: Framer Motion transitions and toasts.
- **Component Design**: Strict TypeScript contracts and reusable form components.

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js](https://nodejs.org/) (v18 or v20 LTS)
- [Docker & Docker Compose](https://www.docker.com/)

---

### Option A: Run Full Stack via Docker Compose (Recommended)

Run the database, API, and frontend in containers with a single command:

```bash
docker compose up --build
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5242
- **Swagger Documentation**: http://localhost:5242/swagger

---

### Option B: Local Development Workflow

#### 1. Start the Database
```bash
docker compose up -d db
```

#### 2. Run Database Migrations
```bash
dotnet ef database update --project src/ClearVoice.Infrastructure --startup-project src/ClearVoice.Api
```

#### 3. Start Backend Services
In separate terminal windows:
```bash
# Start API
dotnet run --project src/ClearVoice.Api

# Start Background Worker
dotnet run --project src/ClearVoice.Workers
```

#### 4. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

> **Automated Dev Script:**  
> - On Windows (PowerShell): `.\start-dev.ps1`  
> - On Linux / macOS (Bash): `./start-dev.sh`

---

## Seeded Demo Credentials

When the database initializes, the application seeds the following demo accounts for testing:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Tenant Admin** | `admin@company.com` | `password123` | Dashboard, Invoices, Webhooks, API Keys |
| **System Operator** | `system@clearvoice.com` | `admin123` | Multi-tenant administration portal |

---

## Running Automated Tests

To run the unit and integration test suite:

```bash
dotnet test tests/ClearVoice.Api.Tests/ClearVoice.Api.Tests.csproj
```

To run frontend production build checks:

```bash
cd frontend
npm run build
```

---

## Limitations / Not Yet Implemented

1. **Simulated Clearance Endpoint**: Integration with the national tax clearance service is implemented using `MockClearanceClient`. A live connection to governmental endpoints (such as Jordan's JoFotara/ISTD portal) requires registered taxpayer tax numbers and mutual TLS (mTLS) certificates issued by the tax department.
2. **Distributed Outbox Locking**: The current background worker uses PostgreSQL optimistic locking for outbox processing; in a distributed multi-node deployment, an advisory lock or Redis distributed lock (e.g., RedLock) should be added.
3. **Real Email/SMS Dispatch**: User onboarding and password reset flows output verification tokens and log notifications internally; production SMTP / SMS gateway integration is not configured.
