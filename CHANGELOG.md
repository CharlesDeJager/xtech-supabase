# Changelog

All notable changes to the **xtech-supabase** VS Code extension are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.0.3] - 2026-03-18

- **Data preview in Data Wrangler**- You can now use the Microsoft Data Wranger extension to view data from tables and views. The data is first written to a temporary file ({tempDirectory}/tmp*{schema}*{object}.jsonl) as Data Wrangler does not support opening data from memory. Temp directory can be changed with `xtech-supabase.useDataWrangler` setting.
- **Use Data Wrangler**- You can disable the use of Data Wrangler for data preview by setting `xtech-supabase.useDataWrangler` to false.

---

## [0.0.2] — 2026-03-11

### Added

- **Copy SQL helper** — inline "Copy CREATE SQL" action on Functions, Policies, Triggers, Indexes, Roles, and Storage Buckets in the tree view; generates ready-to-use DDL and copies it to the clipboard
- SQL generation unit tests (`src/test/suite/sqlGeneration.test.ts`) covering all six object types

### Fixed

- Publisher ID updated to match the VS Code Extension Marketplace registration

---

## [0.0.1] — 2026-03-11

### Added

- **Supabase Explorer** tree view in the activity bar listing all database objects for the active environment (local or linked)
  - Tables, Views, Functions, Policies, Triggers, Indexes, Roles, Storage Buckets
- **Object detail viewers** — dedicated read-only webview panels for each object type:
  - _Tables_ — column schema and live data preview
  - _Views_ — column schema and live data preview
  - _Functions_ — signature, language, volatility, definition
  - _Policies_ — command, roles, USING and WITH CHECK expressions
  - _Triggers_ — timing, event, orientation, function, condition
  - _Indexes_ — method, columns, uniqueness, predicate, definition
  - _Roles_ — attributes, membership, connection limit, validity
  - _Storage Buckets_ — public/private, size limit, MIME types, RLS flag
- **Inline context-menu actions** for every node type (accessible from the tree view title bar and right-click menu)
- **Migration management** — create a new empty migration file via command palette
- **Authentication** — CLI mode (uses local Supabase CLI session) and Token mode (personal access token stored in VS Code SecretStorage)
- **Refresh** — single command to reload all environment data and rebuild the tree
- **Documentation** — `docs/extension-details.md` (setup guide) and `docs/features.md` (feature reference) with annotated screenshots

---

## [Unreleased]

### Planned

- Raw JSON toggle in Storage Bucket viewer ([#4](https://github.com/CharlesDeJager/xtech-supabase/issues/4))
- Copy role SQL helper in Role viewer ([#5](https://github.com/CharlesDeJager/xtech-supabase/issues/5))
