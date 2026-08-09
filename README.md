# ClearVoice E-Invoicing Compliance Gateway

ClearVoice is an institutional-grade B2B e-invoicing compliance gateway, designed to integrate Enterprise Resource Planning (ERP) systems with government tax authorities (specifically tailored to the Jordanian market).

## Architecture

This project is built using a strict **Clean Architecture** approach with **CQRS** (Command Query Responsibility Segregation) principles to ensure high maintainability, testability, and separation of concerns.

The solution is divided into the following layers:

1. **`ClearVoice.Domain`**: Contains the core enterprise logic, entities (`Tenant`, `Invoice`, `User`, etc.), and domain exceptions. It has no dependencies on other layers.
2. **`ClearVoice.Application`**: Contains the use cases of the system. We use **MediatR** for the CQRS pattern to handle Commands (e.g., `SubmitInvoiceCommand`) and Queries. Validation is handled using **FluentValidation** before commands execute.
3. **`ClearVoice.Infrastructure`**: Contains all external concerns. This includes:
   - **Data Access**: Entity Framework Core with PostgreSQL.
   - **Tenant Isolation**: Implemented using EF Core Global Query Filters (`CurrentTenantId`), ensuring multi-tenant data safety at the database level.
   - **External Services**: Implementation of interfaces like `IClearanceClient` (currently mocked) to communicate with government APIs.
4. **`ClearVoice.Api`**: The presentation layer (ASP.NET Core 8 Web API). It depends only on the Application layer for handling requests and uses JWT-based authentication.

## Key Engineering Decisions (Phases 1-4)

### 1. Multi-Tenancy & Data Isolation
Security in a B2B SaaS product is paramount. We implemented strict tenant isolation using **EF Core Global Query Filters**. By injecting an `ITenantProvider` (which extracts the tenant ID from the authenticated user's JWT claims) into the `DbContext`, every single query automatically appends a `WHERE TenantId = @id` clause. This completely eliminates the risk of a developer forgetting to filter by tenant and leaking sensitive invoice data.

### 2. Password Security (Argon2id)
Instead of older algorithms like PBKDF2 or BCrypt, we chose **Argon2id** (the winner of the Password Hashing Competition) for hashing user passwords. It provides superior resistance to GPU cracking attacks and side-channel attacks, adhering to the latest OWASP guidelines.

### 3. CQRS with MediatR & FluentValidation
To keep controllers exceptionally thin and testable, all business logic is encapsulated in MediatR Command/Query handlers in the Application layer. We use FluentValidation to enforce strict request validation (e.g., verifying invoice line items have positive quantities) *before* the handler is invoked.

### 4. Transactional Outbox Pattern (Preparation)
Submitting an invoice to a government API can fail due to network issues. In the `SubmitInvoiceCommandHandler`, we save the `Invoice` to our database and simultaneously save an `OutboxMessage` in the *same database transaction*. A background worker (to be implemented) will reliably process this outbox table and retry submitting to the external API, guaranteeing eventual consistency without two-phase commit (2PC) complications.

## Getting Started

### Prerequisites
- .NET 8 SDK
- Node.js 18+ (for Frontend)
- Docker & Docker Compose (for PostgreSQL database)

### Running Locally
1. Start the database: `docker-compose up -d db`
2. Run migrations: `dotnet ef database update --project src/ClearVoice.Infrastructure --startup-project src/ClearVoice.Api`
3. Run the API: `dotnet run --project src/ClearVoice.Api`
