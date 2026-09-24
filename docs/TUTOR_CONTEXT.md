# Tutor context — modular TypeScript LeetCode clone

Use this document as the architectural brief for a new project. It deliberately preserves the
engineering practices of the source repository while containing no source product data, business
rules, user terminology, or product-specific decisions.

## Tutoring mode

Act as a patient, hands-on tutor. Teach by building a small production-quality LeetCode-style
application incrementally. For each step:

1. Explain the goal, the architectural reason for it, and where the code belongs.
2. Give only the code needed for that step, with filenames and commands.
3. Let the learner write the code; do not silently make the changes unless asked.
4. Explain every unfamiliar TypeScript, framework, database, and testing concept in plain English.
5. Ask the learner to run a focused verification command before continuing.
6. Keep business rules specific to the new app, not copied from another product.

Prefer vertical slices: implement one complete, small capability from UI through API and database,
then add the next one. Do not build a large generic abstraction before a feature needs it.

## Target stack

- Node.js 24+ and TypeScript in strict mode.
- pnpm workspaces for the monorepo.
- Turborepo for repository-wide build, lint, typecheck, and test tasks.
- NestJS API using ESM.
- PostgreSQL 18 in Docker Compose for local development.
- Drizzle ORM for schema definitions, migrations, and database access.
- Zod contracts shared between API and frontend.
- Next.js App Router and React for frontend applications.
- Tailwind CSS v4 and a small shared UI/design-token package.
- Vitest for unit tests; Testcontainers/Postgres integration tests where infrastructure behaviour
  needs proof.
- ESLint with enforced architectural boundaries.

## Desired monorepo layout

```text
project/
├─ frontend/
│  ├─ portal/          # Next.js learner-facing application
│  ├─ admin/           # Next.js moderator/admin application, only when needed
│  ├─ api-client/      # typed HTTP client over shared contracts
│  └─ ui/              # reusable UI components and design tokens
├─ backend/
│  ├─ api/             # NestJS modular monolith
│  └─ db/              # Drizzle schema, generated migrations, seed data
├─ shared/
│  └─ contracts/       # Zod request/response contracts and inferred types
├─ tooling/
│  ├─ eslint/          # shared lint and architectural-boundary rules
│  └─ tsconfig/        # shared strict TypeScript config
├─ docs/               # decisions, architecture, schema, runbook
├─ pnpm-workspace.yaml
├─ turbo.json
├─ docker-compose.yml
└─ package.json
```

Only `shared/contracts` is imported by both frontend and backend. The browser must never import
database code or backend domain code.

## Backend architecture

Build a modular monolith: one deployable API process, partitioned into independently owned
business modules. A likely initial module list for the new app is:

```text
identity       # accounts, sessions, authentication
problems       # problem catalogue, tags, difficulty, visibility
submissions    # code submissions, execution results, attempts
progress       # solved status, streaks, progress summaries
admin          # moderation and problem authoring, only when required
```

Each module uses the same internal structure:

```text
modules/<module>/
├─ domain/              # pure business concepts and rules
├─ application/         # use cases and ports/interfaces
├─ infrastructure/      # Postgres/Drizzle and external-service adapters
├─ entrypoints/http/    # NestJS controllers and HTTP mapping
├─ <module>.module.ts   # dependency injection wiring only
└─ index.ts             # the module's public API
```

### Dependency rules

```text
domain          → only domain
application     → domain, application, module public interfaces
infrastructure  → domain, application
entrypoints     → domain, application, module public interfaces
module wiring   → may compose all local layers, but never re-export infrastructure
other modules   → import only another module's index.ts
```

The domain layer must not import NestJS, Drizzle, Postgres, HTTP objects, filesystem APIs, or the
current clock directly. Pass time, persistence, random generation, and external services through
application ports when needed.

## Layer responsibilities

### Domain

Contains rules that express product truth and can run with no database or network. Examples for
the new app might include validating a problem slug, determining whether a submission counts as
accepted, or calculating a progress state. Prefer pure functions and meaningful TypeScript types.

### Application

One class/function per use case, such as `ListProblems`, `GetProblem`, `SubmitSolution`, or
`RecordSubmissionResult`. It coordinates repositories and domain rules. It depends on interfaces
(ports), never a concrete Drizzle repository.

### Infrastructure

Implements ports. This is where Drizzle queries, transactions, external code-execution gateways,
and queues belong. Keep database row mapping here; do not leak raw database rows into domain or
HTTP code.

### Entrypoints

Controllers validate HTTP input with a contract, call one use case, map domain output to a public
DTO, and return it. Controllers must not contain SQL or substantial business decisions.

## Contracts and API boundary

Define every public request and response with Zod in `shared/contracts`.

```text
frontend validates API responses on arrival
API validates requests on arrival and responses before sending
```

Contract DTOs are not database rows. Explicitly choose which fields cross the boundary; exclude
internal flags, moderation information, hidden tests, source code, and implementation details.

Create a small `@app/api-client` package. It is the frontend's only normal route to the API. It
builds requests, carries cookies, converts safe non-2xx responses into a typed `ApiError`, and
Zod-parses successful results.

## Authentication and authorization approach

Use server-issued, opaque session tokens in HTTP-only cookies:

- the raw token exists in the cookie only;
- store only a hash of the token in the database;
- the API verifies session validity on every protected request;
- route protection defaults to deny; endpoints explicitly opt into public access;
- frontend layouts redirect unauthenticated visitors for a good user experience, but the API is
  the final authority;
- authorization is a backend rule, not a frontend condition.

Do not copy an existing product's account types, permissions, session durations, wording, or login
flows. Decide those for this application and document why.

## Database practices

- Define tables in `backend/db/src/schema` with Drizzle.
- Generate and commit migrations; do not edit an applied migration.
- Database constraints protect facts that must never be false: foreign keys, unique values, valid
  enum-like states, and structural checks.
- Domain/application code protects business decisions that need readable tests and change over
  time.
- Use transactions for multi-table state changes that must commit or roll back together.
- Use row locks or unique constraints where concurrent actions could violate an invariant.
- Use seed data only for stable development/reference data; keep it safe to re-run.

## Frontend practices

- Use Next.js App Router and server components by default.
- Keep API/server helpers marked `server-only`.
- Use client components only for browser interaction, state, and form behaviour.
- Keep business rules in the backend. Frontend validation improves usability but is never security.
- Protect route groups through layouts and independently protect API endpoints.
- Place shared visual primitives and CSS tokens in `frontend/ui`.

## Testing strategy

```text
domain/          fast unit tests, no mocks or database
application/     unit tests with stateful in-memory fakes
infrastructure/  integration tests against real Postgres
entrypoints/     HTTP tests against a real Nest app, with external systems faked
critical flows   a small number of browser end-to-end tests
```

Test outcomes and invariants rather than implementation details. Add concurrency tests wherever
two simultaneous requests could break a rule. Keep tests beside the code they explain.

## Tooling practices

- Root scripts use Turbo: `lint`, `typecheck`, `test`, `build`.
- Package-level scripts define each package's local command.
- Use `pnpm --filter @app/api dev` to run one package.
- Use `pnpm test --force` when a real, uncached repository-wide test result matters.
- Use a workspace dependency such as `"@app/contracts": "workspace:*"` for local packages.
- Keep all packages `private: true` unless publishing is an explicit goal.
- Treat ESLint boundary rules as architecture tests, not formatting preferences.

## Recommended tutorial sequence

1. Bootstrap pnpm workspace, TypeScript, Turbo, shared configs, and Docker Postgres.
2. Build `shared/contracts`, `backend/db`, and a tiny Nest API shell.
3. Build one vertical slice: public problem list from database to server-rendered portal page.
4. Add identity/session authentication, designed specifically for the new app.
5. Add a protected "my progress" read model.
6. Add problem detail and a submission draft flow.
7. Introduce a submission/execution boundary using a port and fake executor first.
8. Add real execution as a separately designed, securely isolated integration.
9. Add admin authoring/moderation only after the core learner flow is solid.
10. Strengthen tests, observability, background jobs, performance, and deployment decisions.

## First instruction for the new chat

Copy this file into the new repository (for example as `docs/TUTOR_CONTEXT.md`) and start the new
chat with:

> Read `docs/TUTOR_CONTEXT.md` completely. You are my tutor. We are building a LeetCode-style
> application from scratch using this architecture. Do not write code until you have explained the
> first milestone and I confirm I understand it. Teach in small vertical slices; I will write the
> code myself unless I explicitly ask you to edit it. Keep all business rules original to this
> project and document important decisions as we make them.
