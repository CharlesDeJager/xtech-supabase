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
  event_object_schema AS schema,
  event_object_table AS table_name,
  action_timing AS timing,
  string_agg(event_manipulation, ', ') AS event
FROM information_schema.triggers
GROUP BY trigger_name, event_object_schema, event_object_table, action_timing
ORDER BY event_object_schema, event_object_table, trigger_name;
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

export const QUERY_OBJECT_SCHEMA = `
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns
WHERE table_schema = $1
  AND table_name = $2
ORDER BY ordinal_position;
`;

export const QUERY_FUNCTION_DETAILS = `
SELECT
  p.proname AS function_name,
  n.nspname AS schema,
  pg_get_function_identity_arguments(p.oid) AS argument_signature,
  pg_get_function_result(p.oid) AS return_type,
  l.lanname AS language,
  CASE p.provolatile
    WHEN 'i' THEN 'IMMUTABLE'
    WHEN 's' THEN 'STABLE'
    ELSE 'VOLATILE'
  END AS volatility,
  p.prosecdef AS security_definer,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = $1
  AND p.proname = $2
ORDER BY argument_signature;
`;

export const QUERY_POLICY_DETAILS = `
SELECT
  schemaname AS schema,
  tablename AS table_name,
  policyname AS policy_name,
  cmd,
  roles,
  permissive,
  qual AS using_expression,
  with_check
FROM pg_policies
WHERE schemaname = $1
  AND tablename = $2
  AND policyname = $3;
`;

export const QUERY_TRIGGER_DETAILS = `
SELECT
  trigger_schema AS schema,
  trigger_name,
  event_object_table AS table_name,
  action_timing AS timing,
  event_manipulation AS event,
  action_orientation AS orientation,
  action_statement
FROM information_schema.triggers
WHERE event_object_schema = $1
  AND event_object_table = $2
  AND trigger_name = $3
ORDER BY action_timing, event_manipulation;
`;

export const QUERY_INDEX_DETAILS = `
SELECT
  schemaname AS schema,
  tablename AS table_name,
  indexname AS index_name,
  indexdef
FROM pg_indexes
WHERE schemaname = $1
  AND tablename = $2
  AND indexname = $3;
`;

export const QUERY_ROLE_DETAILS = `
SELECT
  rolname AS role_name,
  rolsuper,
  rolinherit,
  rolcreaterole,
  rolcreatedb,
  rolcanlogin,
  rolreplication,
  rolbypassrls,
  rolconnlimit,
  rolvaliduntil::text AS valid_until
FROM pg_roles
WHERE rolname = $1;
`;

export const QUERY_STORAGE_BUCKET_DETAILS = `
SELECT to_jsonb(b) AS details_json
FROM storage.buckets b
WHERE b.id = $1;
`;
