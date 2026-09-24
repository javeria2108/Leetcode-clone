# Project decisions

## 001: Shared TypeScript safety settings

Keep common TypeScript safety checks in @app/tsconfig.

Each application or library will inherit these checks and define its
own runtime and build settings.

Reason: frontend and backend packages need consistent safety checks,
but their frameworks may need different compilation settings.

## 002: Repository-wide task coordination

Root lint, typecheck, test, and build scripts delegate to Turborepo.
Each package defines the local commands it needs.

Build and typecheck tasks first build workspace dependencies so their
compiled JavaScript and type declarations are available.

Reason: keep one consistent entry point for repository checks while
letting individual packages own their tooling.

## 003: Local PostgreSQL through Docker Compose

Use PostgreSQL 18 with a named volume to preserve development data.
Expose the database on localhost port 5432.
Use local-only development credentials and a readiness health check.

Reason: provide a repeatable database setup for development and the
first database-backed feature.

## 004: Minimal public problem-list contract

The first problem-list response contains an items array.
Each item exposes only a slug and title, both nonempty strings.
An empty catalogue returns an empty items array.

Define runtime schemas with Zod in @app/contracts and derive
TypeScript types from them.

Reason: give the API and portal one explicit public data contract.

## 005: Compiled contracts package

@app/contracts exposes compiled ESM JavaScript and TypeScript declarations
from dist through its package exports.

Reason: provide one explicit entry point usable by the API and portal.

## 006: Branch and pull-request workflow

Make each scoped change on a separate branch created from updated master.
Verify the change before committing, pushing, and opening a pull request.
Merge the pull request before starting the next independent branch.

Reason: keep changes small, reviewable, and documented.
