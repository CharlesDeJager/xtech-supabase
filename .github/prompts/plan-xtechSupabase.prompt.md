## Plan: Supabase VS Code Extension v1

Build a TypeScript VS Code extension from scratch with a strict Phase 1 scope focused on read-only visibility and migration status for local + linked Supabase environments. Use Supabase CLI context plus optional SecretStorage token support for remote auth fallback, and provide a Tree View-first UX with structured logs in a dedicated Output Channel. Defer generic CLI command execution to Phase 2.

**Steps**

1. Phase 0: Foundation and scaffold
1. Initialize a TypeScript VS Code extension scaffold (commands, activation events, package metadata, build/test/lint scripts).
1. Define extension settings for project discovery, manual override, refresh intervals, and auth mode toggle (CLI context preferred, SecretStorage optional).
1. Create a small architecture baseline with separations for: Supabase environment detection, migration services, schema/object introspection service, UI view models, and logging.

1. Phase 1A: Environment and auth plumbing (_depends on Phase 0_)
1. Implement project discovery with priority: explicit user override first, then auto-detection from workspace Supabase conventions.
1. Implement local environment resolver and linked environment resolver.
1. Implement auth abstraction:
1. Use Supabase CLI session/context by default for linked operations.
1. Support optional persisted token via VS Code SecretStorage for fallback/manual scenarios.
1. Add robust diagnostics for missing CLI, invalid login state, or absent project linkage.

1. Phase 1B: Migrations experience (_depends on 1A_)
1. Build migrations data model combining migration files + local applied history + linked applied history.
1. Compute and surface three required states: pending, applied-local, applied-linked.
1. Add command to create new migration with naming validation and immediate tree refresh.
1. Add visual indicators and filtering for migration status in the extension Tree View.

1. Phase 1C: Database object browsing (_depends on 1A; parallel with 1B where possible_)
1. Implement read-only introspection providers for required object categories:
1. Schemas, Tables, Views, Functions, Triggers, ENUMs, Indexes, Roles, Policies, Migrations, Storage buckets/files.
1. Normalize object metadata into a common UI node model with child relationships and lazy loading.
1. Add per-environment browsing (local vs linked) with clear labeling to avoid accidental confusion.

1. Phase 1D: UX, observability, and resiliency (_depends on 1B and 1C_)
1. Provide a dedicated Output Channel for structured logs and operation traces.
1. Add refresh commands (global + section scoped) and graceful retry patterns for transient failures.
1. Add empty/error states with actionable remediation text (install CLI, login, link project, configure override).

1. Phase 1E: Hardening and release prep (_depends on 1D_)
1. Add unit tests for status computation, discovery precedence, and auth resolver behavior.
1. Add integration-style tests for parsing CLI/SQL responses and tree node shaping.
1. Validate extension activation performance and ensure activation is event-driven.
1. Produce initial README and usage docs aligned to strict Phase 1 boundaries.

**Relevant files**

- /Users/charlesdejager/dev/plugins/xtech-supabase/requirements.md — source of scope, phased delivery, and object inventory.
- New extension scaffold artifacts (package manifest, TypeScript config, source modules, tests, docs) to be created during implementation.

**Verification**

1. Run extension tests and lint checks in CI/local and verify no activation/runtime errors.
1. Manual local workflow: detect project, load local objects, create migration, verify migration status transitions.
1. Manual linked workflow: authenticate via CLI context, load linked objects, verify migration indicators for linked state.
1. Fault-path validation: no CLI installed, CLI not logged in, missing linkage, invalid override path, and token fallback behavior.
1. UX validation in VS Code: tree performance with large schemas, clear labels between local/linked, output log readability.

**Decisions**

- Include: TypeScript implementation, strict Phase 1 feature set, read-only object browsing for all listed object classes.
- Include: Migration status model with three states (pending, applied-local, applied-linked).
- Include: Project discovery with both auto-detect and manual override.
- Include: Linked auth primarily via Supabase CLI context, with SecretStorage fallback option.
- Include: Structured logs via custom Output Channel.
- Exclude (for now): Broad Phase 2 generic CLI execution command surface.

**Further Considerations**

1. Decide whether linked and local nodes should be shown side-by-side in one tree or as separate root views; recommendation: separate roots in one view for clarity.
1. Decide whether Storage file listing should be shallow by default with manual expand to avoid expensive fetches; recommendation: lazy paginated listing.
1. Decide whether migrations should support quick actions (open SQL, copy name) in v1; recommendation: include non-destructive quick actions only.
