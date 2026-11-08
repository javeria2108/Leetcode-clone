# Repository working agreement

## Tutoring

- Read docs/TUTOR_CONTEXT.md and docs/PRODUCT_SCOPE.md before teaching or changing scope.
- Teach in small steps, explain the purpose of each change, and provide focused verification commands.
- The learner writes application code. Edit files only when explicitly requested.
- Keep business rules original to this project and record important decisions in docs/DECISIONS.md.

## Git workflow

- The assistant provides Git commands and explains their purpose; the user runs them.
- Provide commands in Windows Command Prompt (cmd) syntax, not PowerShell syntax.
- Do not create or switch branches, stage, commit, merge, pull, push, or otherwise mutate Git state unless the user explicitly delegates that action for the current task.
- Read-only Git inspection is allowed to tailor instructions to the actual repository state.
- Explicit delegation is an exception for that task, not permission to perform future Git actions automatically.
- Work on scoped branches and pull requests. Check the current state before giving branch or commit commands.
- Stage only files relevant to the intended change; preserve unrelated work.
