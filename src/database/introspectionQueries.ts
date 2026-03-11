export const QUERY_SCHEMAS = `
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1')
  AND schema_name NOT LIKE 'pg_%'
ORDER BY schema_name;
`;

export const QUERY_TABLES = `
SELECT table_name, table_schema AS schema
FROM information_schema.tables
WHERE table_type = 'BASE TABLE'
  AND table_schema = $1
ORDER BY table_name;
`;

export const QUERY_VIEWS = `
SELECT table_name AS view_name, table_schema AS schema
FROM information_schema.views
WHERE table_schema = $1
ORDER BY table_name;
`;

export const QUERY_FUNCTIONS = `
SELECT
  routine_name AS function_name,
  routine_schema AS schema,
  data_type AS return_type
FROM information_schema.routines
WHERE routine_type = 'FUNCTION'
  AND routine_schema = $1
ORDER BY routine_name;
`;

export const QUERY_TRIGGERS = `
SELECT
  trigger_name,
  event_object_table AS table_name,
  string_agg(event_manipulation, ', ') AS event
FROM information_schema.triggers
GROUP BY trigger_name, event_object_table
ORDER BY trigger_name;
`;

export const QUERY_ENUMS = `
SELECT
  t.typname AS type_name,
  n.nspname AS schema,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typtype = 'e'
GROUP BY t.typname, n.nspname
ORDER BY n.nspname, t.typname;
`;

export const QUERY_INDEXES = `
SELECT
  i.relname AS index_name,
  t.relname AS table_name,
  n.nspname AS schema
FROM pg_index ix
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_class t ON t.oid = ix.indrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY n.nspname, t.relname, i.relname;
`;

export const QUERY_ROLES = `
SELECT rolname AS role_name
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;
`;

export const QUERY_POLICIES = `
SELECT
  pol.polname AS policy_name,
  cls.relname AS table_name,
  nsp.nspname AS schema
FROM pg_policy pol
JOIN pg_class cls ON cls.oid = pol.polrelid
JOIN pg_namespace nsp ON nsp.oid = cls.relnamespace
ORDER BY nsp.nspname, cls.relname, pol.polname;
`;

export const QUERY_STORAGE_BUCKETS = `
SELECT id, name, public FROM storage.buckets ORDER BY name;
`;
