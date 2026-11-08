# Collaborative coding practice platform

## Product direction

Build a LeetCode-inspired application focused on pair programming and visual
execution exploration. Learners choose a problem, create a private room,
invite a partner, edit together, run code, and submit solutions for judging.
Use original project rules and problem content.

## Learning goals

- Relational modeling, migrations, constraints, transactions, and concurrency.
- Real-time synchronization, event ordering, reconnects, and authorization.
- Queues, workers, retries, idempotency, and backpressure.
- Sandboxed execution, resource limits, test harnesses, and security boundaries.
- Execution instrumentation, trace design, and interactive visualization.
- Observability, load testing, failure recovery, and capacity planning.

## Initial scope and rules

- Start with a public problem list, then problem details.
- Private practice rooms initially support two authenticated participants.
- Enforce membership on the backend for room data and real-time operations.
- Execute an immutable snapshot of code, language, and inputs/configuration.
- Associate execution results and traces with their exact snapshot.
- Keep hidden judging inputs and their traces out of public responses.
- Start with a fake executor to prove orchestration before real execution.
- Execute untrusted code outside the API with deliberately designed isolation.

## Visual debugger: initial planning assumption

Start with recorded execution replay rather than control of a live process.
Support one language, source-line highlighting, selected variable values, and
arrays. Define supported language features and trace size limits before building.
Allow local stepping first, then add synchronized playback between participants.

The first language, tracing technique, and synchronization algorithm remain
undecided. Live breakpoints are a possible later extension.

## Learning roadmap

1. Finish the public problem list through Postgres, API, and portal.
2. Add problem details, identity, private rooms, and partner invitations.
3. Add shared editing, presence, persistence, and reconnection.
4. Queue immutable snapshots, use a fake worker, and report live statuses.
5. Add one-language isolated execution and visible/hidden judging tests.
6. Record bounded traces and build visual replay; then share playback.
7. Add metrics, tracing, load tests, failure recovery, and backpressure.

Introduce infrastructure only when needed. Keep the API a modular monolith;
execution workers run separately. Retain the stack and testing strategy in
TUTOR_CONTEXT.md. Redis/BullMQ are planned queue candidates, not installed
infrastructure. Choose real-time protocols when their slice begins.

## Deferred features

Contests, rankings, multiple execution languages, larger rooms, live breakpoints,
and advanced admin workflows are outside the initial scope. Decide progress
attribution for pair work before implementing solved status.

## Working agreement

The learner writes application code; the tutor explains small steps and provides
focused verification commands in Windows cmd syntax. Edit files only when
explicitly requested. Use scoped branches and PRs. Record decisions in DECISIONS.md.
