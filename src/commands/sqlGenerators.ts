import {
  ColumnRow,
  FunctionDetailsRow,
  PolicyDetailsRow,
  TriggerDetailsRow,
  IndexDetailsRow,
  RoleDetailsRow,
} from '../database/databaseService';

export function generateCreateTableSql(
  schema: string,
  name: string,
  columns: ColumnRow[],
): string {
  if (columns.length === 0) {
    return `SELECT * FROM "${schema}"."${name}";`;
  }
  const cols = columns
    .map((c) => {
      const nullable = c.is_nullable === 'YES' ? '' : ' NOT NULL';
      const defaultVal = c.column_default ? ` DEFAULT ${c.column_default}` : '';
      return `  "${c.column_name}" ${c.data_type}${nullable}${defaultVal}`;
    })
    .join(',\n');
  return `CREATE TABLE IF NOT EXISTS "${schema}"."${name}" (\n${cols}\n);`;
}

export function generateSelectSql(schema: string, name: string): string {
  return `SELECT * FROM "${schema}"."${name}";`;
}

export function generateFunctionSql(details: FunctionDetailsRow[]): string {
  return details.map((d) => d.definition).join('\n\n');
}

export function generatePolicySql(detail: PolicyDetailsRow): string {
  const roles = Array.isArray(detail.roles)
    ? detail.roles.join(', ')
    : detail.roles;
  const permissive =
    String(detail.permissive).toUpperCase() === 'PERMISSIVE'
      ? 'PERMISSIVE'
      : 'RESTRICTIVE';
  const lines = [
    `CREATE POLICY "${detail.policy_name}" ON "${detail.schema}"."${detail.table_name}"`,
    `  AS ${permissive}`,
    `  FOR ${detail.cmd}`,
    `  TO ${roles}`,
  ];
  if (detail.using_expression) {
    lines.push(`  USING (${detail.using_expression})`);
  }
  if (detail.with_check) {
    lines.push(`  WITH CHECK (${detail.with_check})`);
  }
  return lines.join('\n') + ';';
}

export function generateTriggerSql(details: TriggerDetailsRow[]): string {
  if (details.length === 0) {
    return '';
  }
  const d = details[0];
  const events = details.map((r) => r.event).join(' OR ');
  return [
    `CREATE OR REPLACE TRIGGER "${d.trigger_name}"`,
    `  ${d.timing} ${events}`,
    `  ON "${d.schema}"."${d.table_name}"`,
    `  FOR EACH ${d.orientation}`,
    `  ${d.action_statement};`,
  ].join('\n');
}

export function generateIndexSql(detail: IndexDetailsRow): string {
  const def = detail.indexdef.endsWith(';')
    ? detail.indexdef
    : `${detail.indexdef};`;
  return def;
}

export function generateRoleSql(detail: RoleDetailsRow): string {
  const attrs: string[] = [
    detail.rolsuper ? 'SUPERUSER' : 'NOSUPERUSER',
    detail.rolinherit ? 'INHERIT' : 'NOINHERIT',
    detail.rolcreaterole ? 'CREATEROLE' : 'NOCREATEROLE',
    detail.rolcreatedb ? 'CREATEDB' : 'NOCREATEDB',
    detail.rolcanlogin ? 'LOGIN' : 'NOLOGIN',
    detail.rolreplication ? 'REPLICATION' : 'NOREPLICATION',
    detail.rolbypassrls ? 'BYPASSRLS' : 'NOBYPASSRLS',
    `CONNECTION LIMIT ${detail.rolconnlimit}`,
  ];
  if (detail.valid_until) {
    attrs.push(`VALID UNTIL '${detail.valid_until}'`);
  }
  return `CREATE ROLE "${detail.role_name}" WITH\n  ${attrs.join('\n  ')};`;
}

export function generateStorageBucketSql(
  bucketId: string,
  bucketName: string,
  isPublic: boolean,
): string {
  return [
    `INSERT INTO storage.buckets (id, name, public)`,
    `VALUES ('${bucketId}', '${bucketName}', ${isPublic})`,
    `ON CONFLICT (id) DO NOTHING;`,
  ].join('\n');
}
