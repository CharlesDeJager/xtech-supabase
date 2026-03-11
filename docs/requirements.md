# Visual Studio Code Extension

## Background

Developers currently have to use command line to manage supabase. They have to also open up the supabase dashboard (local or remote) to run sql (unless they want to try and run it via plsql or supabase cli). There must be an easier way to do this.

## Requirement

An VS Code extension that allows developers to manage both linkecd and local supabase environments

### Phase 1

1. **Supabase Migrations**: Developers must be able to see and create new migrations and if those migrations have been pushed to local and pushed to linked (show to different indicators)

2. **Database Tables, Functions, ENUMS, etc.**: Developers must be able to see any database object that can be exposed through either the CLI or through SQL scripts this would include:
   - Schemas
   - Tables
   - Views
   - Database functions
   - Triggers
   - Enumerated types
   - Indexes
   - Roles
   - Policies
   - Migrations
   - Storage (buckets and files)

### Phase 2

1. **Execute CLI functions**: Developers must be able to execute cli functions. See [Supabase CLI](https://supabase.com/docs/reference/cli/introduction) for reference.
