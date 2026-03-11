# XTECH Supabase

A VS Code extension for managing both local and linked Supabase environments directly from your editor.

## Overview

XTECH Supabase gives developers a first-class VS Code experience for working with Supabase projects — no more switching between terminals and dashboards. View migrations, database objects, storage buckets, and more from a dedicated sidebar panel.

## Features (Phase 1)

- **Supabase Explorer** — Dedicated activity bar panel showing Local and Linked environments side by side
- **Migration Management** — View all `.sql` migration files with status indicators:
  - ⏳ Pending (not applied anywhere)
  - ✓ Applied locally only
  - ✓ Applied on linked project only
  - ✓ Applied both locally and on linked project
- **Create Migrations** — Generate timestamped migration files with a guided input
- **Database Introspection** — Browse:
  - Schemas
  - Tables
  - Views
  - Database Functions
  - Triggers
  - Enumerated Types (ENUMs)
  - Indexes
  - Roles
  - Row-Level Security Policies
  - Storage Buckets
- **Dual Environment Support** — Simultaneously inspect local (Docker) and linked (cloud) Supabase instances
- **Authentication** — Supports both Supabase CLI session auth and personal access tokens

## Requirements

- **VS Code** 1.85.0 or later
- **Supabase CLI** (`supabase`) installed and available on your `PATH`
- A workspace containing a `supabase/config.toml` file (i.e., a Supabase project)

## Installation

1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for **XTECH Supabase**
4. Click **Install**

Or install from a `.vsix` file:
```bash
code --install-extension xtech-supabase-0.0.1.vsix
```

## Configuration

All settings are available under **Settings → Extensions → XTECH Supabase**.

| Setting | Type | Default | Description |
|---|---|---|---|
| `xtech-supabase.projectPath` | string | — | Override the auto-detected Supabase project root path |
| `xtech-supabase.authMode` | `"cli"` \| `"token"` | `"cli"` | Auth mode: `cli` uses the Supabase CLI session; `token` uses a stored personal access token |
| `xtech-supabase.refreshInterval` | number | `0` | Auto-refresh interval in seconds (0 = disabled) |
| `xtech-supabase.localDbUrl` | string | — | Override the local database connection URL |
| `xtech-supabase.linkedProjectRef` | string | — | Override the linked Supabase project reference |

## Authentication Setup

### CLI Mode (default)

1. Log in with the Supabase CLI:
   ```bash
   supabase login
   ```
2. Link your project (if using a linked environment):
   ```bash
   supabase link --project-ref <your-project-ref>
   ```
3. The extension will use your CLI session automatically.

### Token Mode

1. Generate a personal access token at [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
2. Set `xtech-supabase.authMode` to `"token"` in settings
3. Run the command **XTECH Supabase: Set Supabase Access Token** (`Ctrl+Shift+P` → `Set Supabase Access Token`)
4. Paste your token when prompted (stored securely in VS Code's SecretStorage)

To remove the token: run **XTECH Supabase: Clear Supabase Access Token**.

## Usage

### Opening the Explorer

Click the **database icon** in the Activity Bar, or run:
```
XTECH Supabase: Refresh Supabase Explorer
```

### Migration Workflow

1. Open the **Supabase Explorer** panel
2. Expand **Local → Migrations** to see all migration files and their status
3. To create a new migration:
   - Right-click the Migrations category, or
   - Run **XTECH Supabase: Create New Migration** from the Command Palette
   - Enter a name (letters, numbers, underscores only — e.g., `create_users_table`)
   - The file is created in `supabase/migrations/` with a timestamp prefix and opened automatically

### Database Browsing

Expand any category under **Local** or **Linked** to browse:
- **Tables** — all tables in the `public` schema
- **Views** — all views in the `public` schema  
- **Functions** — all functions with return types
- **Triggers** — all triggers with their events
- **ENUMs** — enumerated types with their values
- **Indexes** — all indexes with their target tables
- **Roles** — all non-system database roles
- **Policies** — all RLS policies
- **Storage** — storage buckets (public/private)

Click any migration file to open it in the editor.

### Refreshing Data

- Click the **refresh icon** in the Supabase Explorer toolbar
- Or run **XTECH Supabase: Refresh Supabase Explorer** from the Command Palette
- Or configure `xtech-supabase.refreshInterval` for automatic periodic refreshes

## Commands

| Command | Description |
|---|---|
| `XTECH Supabase: Refresh Supabase Explorer` | Refresh all data in the explorer |
| `XTECH Supabase: Create New Migration` | Create a new timestamped migration file |
| `XTECH Supabase: Set Supabase Access Token` | Store a personal access token securely |
| `XTECH Supabase: Clear Supabase Access Token` | Remove the stored access token |

## Phase 1 Scope

This release (Phase 1) includes:
- ✅ Migration file management and status tracking
- ✅ Database object browsing (read-only)
- ✅ Local and linked environment support
- ✅ CLI and token authentication modes
- ✅ Storage bucket listing

**Not included in Phase 1 (coming in Phase 2):**
- ❌ Execute arbitrary CLI commands from the UI
- ❌ Run SQL queries from the editor
- ❌ Edit database objects
- ❌ Push/apply migrations from the UI
- ❌ Manage storage files

## Known Limitations

- Database introspection requires the Supabase CLI to be running locally (`supabase start`)
- Linked environment queries require a valid personal access token in `token` auth mode
- Migration status detection depends on the Supabase CLI's `migration list` command output format

## License

MIT
