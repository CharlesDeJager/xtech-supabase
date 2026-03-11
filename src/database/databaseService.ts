import { Client } from 'pg';
import { Logger } from '../logger';
import {
  QUERY_SCHEMAS,
  QUERY_TABLES,
  QUERY_VIEWS,
  QUERY_FUNCTIONS,
  QUERY_TRIGGERS,
  QUERY_ENUMS,
  QUERY_INDEXES,
  QUERY_ROLES,
  QUERY_POLICIES,
  QUERY_STORAGE_BUCKETS,
  QUERY_OBJECT_SCHEMA,
  QUERY_FUNCTION_DETAILS,
  QUERY_POLICY_DETAILS,
  QUERY_TRIGGER_DETAILS,
  QUERY_INDEX_DETAILS,
  QUERY_ROLE_DETAILS,
  QUERY_STORAGE_BUCKET_DETAILS,
} from './introspectionQueries';

export interface SchemaRow {
  schema_name: string;
}

export interface TableRow {
  table_name: string;
  schema: string;
}

export interface ViewRow {
  view_name: string;
  schema: string;
}

export interface FunctionRow {
  function_name: string;
  schema: string;
  return_type: string;
}

export interface TriggerRow {
  trigger_name: string;
  schema: string;
  table_name: string;
  timing: string;
  event: string;
}

export interface EnumRow {
  type_name: string;
  schema: string;
  values: string[];
}

export interface IndexRow {
  index_name: string;
  table_name: string;
  schema: string;
}

export interface RoleRow {
  role_name: string;
}

export interface PolicyRow {
  policy_name: string;
  table_name: string;
  schema: string;
}

export interface StorageBucketRow {
  id: string;
  name: string;
  public: boolean;
}

export interface ColumnRow {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  ordinal_position: number;
}

export interface FunctionDetailsRow {
  function_name: string;
  schema: string;
  argument_signature: string;
  return_type: string;
  language: string;
  volatility: string;
  security_definer: boolean;
  definition: string;
}

export interface PolicyDetailsRow {
  schema: string;
  table_name: string;
  policy_name: string;
  cmd: string;
  roles: string[] | string;
  permissive: string;
  using_expression: string | null;
  with_check: string | null;
}

export interface TriggerDetailsRow {
  schema: string;
  trigger_name: string;
  table_name: string;
  timing: string;
  event: string;
  orientation: string;
  action_statement: string;
}

export interface IndexDetailsRow {
  schema: string;
  table_name: string;
  index_name: string;
  indexdef: string;
}

export interface RoleDetailsRow {
  role_name: string;
  rolsuper: boolean;
  rolinherit: boolean;
  rolcreaterole: boolean;
  rolcreatedb: boolean;
  rolcanlogin: boolean;
  rolreplication: boolean;
  rolbypassrls: boolean;
  rolconnlimit: number;
  valid_until: string | null;
}

export interface StorageBucketDetailsRow {
  details_json: Record<string, unknown>;
}

export class DatabaseService {
  private dbUrl: string;
  private token: string | undefined;
  private logger: Logger;
  private projectRoot: string | undefined;

  constructor(
    dbUrl: string,
    token: string | undefined,
    logger: Logger,
    projectRoot?: string,
  ) {
    this.dbUrl = dbUrl;
    this.token = token;
    this.logger = logger;
    this.projectRoot = projectRoot;
  }

  private isLinkedUrl(url: string): boolean {
    return url.includes('supabase.co') || url.includes('supabase.io');
  }

  private extractProjectUrl(dbUrl: string): string | undefined {
    // Transform postgres connection URL to Supabase REST URL if needed
    const match = dbUrl.match(/([a-z0-9]+)\.supabase\.co/);
    if (match) {
      return `https://${match[1]}.supabase.co`;
    }
    return undefined;
  }

  async query<T>(sql: string): Promise<T[]> {
    if (this.canUsePostgres()) {
      return this.queryViaPostgres<T>(sql);
    }
    if (this.token) {
      return this.queryViaManagementApi<T>(sql);
    }
    this.logger.warn('No query method available (no direct DB URL or token).');
    return [];
  }

  private canUsePostgres(): boolean {
    return (
      this.dbUrl.startsWith('postgres://') ||
      this.dbUrl.startsWith('postgresql://')
    );
  }

  private async queryViaPostgres<T>(sql: string): Promise<T[]> {
    const useSsl = this.isLinkedUrl(this.dbUrl);
    const client = new Client({
      connectionString: this.dbUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 15000,
      query_timeout: 30000,
    });

    try {
      await client.connect();
      const result = await client.query(sql);
      return result.rows as T[];
    } catch (err) {
      this.logger.error('Postgres query failed', err);
      return [];
    } finally {
      await client.end().catch(() => undefined);
    }
  }

  private async queryViaManagementApi<T>(sql: string): Promise<T[]> {
    if (!this.token) {
      return [];
    }
    const refMatch = this.dbUrl.match(/([a-z0-9]+)\.supabase\.co/);
    if (!refMatch) {
      this.logger.warn(
        'Cannot determine project ref from DB URL for Management API.',
      );
      return [];
    }
    const ref = refMatch[1];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://api.supabase.com/v1/projects/${ref}/database/query`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: sql }),
          signal: controller.signal,
        },
      );

      if (!response.ok) {
        const body = await response.text();
        if (response.status === 401) {
          this.logger.warn(
            'Management API auth failed (401). Ensure token is a Supabase Personal Access Token (sbp_...) and not a project anon/service_role key. Also remove any leading "Bearer " prefix when storing the token.',
          );
        }
        this.logger.warn(
          `Management API query failed: ${response.status} — ${body}`,
        );
        return [];
      }

      const data = (await response.json()) as T[];
      return data;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') {
        this.logger.warn('Management API query timed out after 15s');
        return [];
      }
      this.logger.error('Management API query error', err);
      return [];
    } finally {
      clearTimeout(timeout);
    }
  }

  async getSchemas(): Promise<SchemaRow[]> {
    try {
      return await this.query<SchemaRow>(QUERY_SCHEMAS);
    } catch (err) {
      this.logger.error('getSchemas failed', err);
      return [];
    }
  }

  async getTables(schema: string): Promise<TableRow[]> {
    try {
      const sql = QUERY_TABLES.replace('$1', `'${schema}'`);
      return await this.query<TableRow>(sql);
    } catch (err) {
      this.logger.error(`getTables(${schema}) failed`, err);
      return [];
    }
  }

  async getViews(schema: string): Promise<ViewRow[]> {
    try {
      const sql = QUERY_VIEWS.replace('$1', `'${schema}'`);
      return await this.query<ViewRow>(sql);
    } catch (err) {
      this.logger.error(`getViews(${schema}) failed`, err);
      return [];
    }
  }

  async getFunctions(schema: string): Promise<FunctionRow[]> {
    try {
      const sql = QUERY_FUNCTIONS.replace('$1', `'${schema}'`);
      return await this.query<FunctionRow>(sql);
    } catch (err) {
      this.logger.error(`getFunctions(${schema}) failed`, err);
      return [];
    }
  }

  async getTriggers(): Promise<TriggerRow[]> {
    try {
      return await this.query<TriggerRow>(QUERY_TRIGGERS);
    } catch (err) {
      this.logger.error('getTriggers failed', err);
      return [];
    }
  }

  async getEnums(): Promise<EnumRow[]> {
    try {
      return await this.query<EnumRow>(QUERY_ENUMS);
    } catch (err) {
      this.logger.error('getEnums failed', err);
      return [];
    }
  }

  async getIndexes(): Promise<IndexRow[]> {
    try {
      return await this.query<IndexRow>(QUERY_INDEXES);
    } catch (err) {
      this.logger.error('getIndexes failed', err);
      return [];
    }
  }

  async getRoles(): Promise<RoleRow[]> {
    try {
      return await this.query<RoleRow>(QUERY_ROLES);
    } catch (err) {
      this.logger.error('getRoles failed', err);
      return [];
    }
  }

  async getPolicies(): Promise<PolicyRow[]> {
    try {
      return await this.query<PolicyRow>(QUERY_POLICIES);
    } catch (err) {
      this.logger.error('getPolicies failed', err);
      return [];
    }
  }

  async getStorageBuckets(): Promise<StorageBucketRow[]> {
    try {
      return await this.query<StorageBucketRow>(QUERY_STORAGE_BUCKETS);
    } catch (err) {
      this.logger.error('getStorageBuckets failed', err);
      return [];
    }
  }

  async getObjectSchema(schema: string, name: string): Promise<ColumnRow[]> {
    try {
      const sql = QUERY_OBJECT_SCHEMA.replace(
        '$1',
        `'${schema.replace(/'/g, "''")}'`,
      ).replace('$2', `'${name.replace(/'/g, "''")}'`);
      return await this.query<ColumnRow>(sql);
    } catch (err) {
      this.logger.error(`getObjectSchema(${schema}.${name}) failed`, err);
      return [];
    }
  }

  async getObjectData(
    schema: string,
    name: string,
    limit = 100,
  ): Promise<Record<string, unknown>[]> {
    try {
      const safeSchema = `"${schema.replace(/"/g, '""')}"`;
      const safeName = `"${name.replace(/"/g, '""')}"`;
      const sql = `SELECT * FROM ${safeSchema}.${safeName} LIMIT ${limit};`;
      return await this.query<Record<string, unknown>>(sql);
    } catch (err) {
      this.logger.error(`getObjectData(${schema}.${name}) failed`, err);
      return [];
    }
  }

  async getFunctionDetails(
    schema: string,
    name: string,
  ): Promise<FunctionDetailsRow[]> {
    try {
      const sql = QUERY_FUNCTION_DETAILS.replace(
        '$1',
        `'${schema.replace(/'/g, "''")}'`,
      ).replace('$2', `'${name.replace(/'/g, "''")}'`);
      return await this.query<FunctionDetailsRow>(sql);
    } catch (err) {
      this.logger.error(`getFunctionDetails(${schema}.${name}) failed`, err);
      return [];
    }
  }

  async getPolicyDetails(
    schema: string,
    tableName: string,
    policyName: string,
  ): Promise<PolicyDetailsRow[]> {
    try {
      const sql = QUERY_POLICY_DETAILS.replace(
        '$1',
        `'${schema.replace(/'/g, "''")}'`,
      )
        .replace('$2', `'${tableName.replace(/'/g, "''")}'`)
        .replace('$3', `'${policyName.replace(/'/g, "''")}'`);
      return await this.query<PolicyDetailsRow>(sql);
    } catch (err) {
      this.logger.error(
        `getPolicyDetails(${schema}.${tableName}.${policyName}) failed`,
        err,
      );
      return [];
    }
  }

  async getTriggerDetails(
    schema: string,
    tableName: string,
    triggerName: string,
  ): Promise<TriggerDetailsRow[]> {
    try {
      const sql = QUERY_TRIGGER_DETAILS.replace(
        '$1',
        `'${schema.replace(/'/g, "''")}'`,
      )
        .replace('$2', `'${tableName.replace(/'/g, "''")}'`)
        .replace('$3', `'${triggerName.replace(/'/g, "''")}'`);
      return await this.query<TriggerDetailsRow>(sql);
    } catch (err) {
      this.logger.error(
        `getTriggerDetails(${schema}.${tableName}.${triggerName}) failed`,
        err,
      );
      return [];
    }
  }

  async getIndexDetails(
    schema: string,
    tableName: string,
    indexName: string,
  ): Promise<IndexDetailsRow[]> {
    try {
      const sql = QUERY_INDEX_DETAILS.replace(
        '$1',
        `'${schema.replace(/'/g, "''")}'`,
      )
        .replace('$2', `'${tableName.replace(/'/g, "''")}'`)
        .replace('$3', `'${indexName.replace(/'/g, "''")}'`);
      return await this.query<IndexDetailsRow>(sql);
    } catch (err) {
      this.logger.error(
        `getIndexDetails(${schema}.${tableName}.${indexName}) failed`,
        err,
      );
      return [];
    }
  }

  async getRoleDetails(roleName: string): Promise<RoleDetailsRow[]> {
    try {
      const sql = QUERY_ROLE_DETAILS.replace(
        '$1',
        `'${roleName.replace(/'/g, "''")}'`,
      );
      return await this.query<RoleDetailsRow>(sql);
    } catch (err) {
      this.logger.error(`getRoleDetails(${roleName}) failed`, err);
      return [];
    }
  }

  async getStorageBucketDetails(
    bucketId: string,
  ): Promise<StorageBucketDetailsRow[]> {
    try {
      const sql = QUERY_STORAGE_BUCKET_DETAILS.replace(
        '$1',
        `'${bucketId.replace(/'/g, "''")}'`,
      );
      return await this.query<StorageBucketDetailsRow>(sql);
    } catch (err) {
      this.logger.error(`getStorageBucketDetails(${bucketId}) failed`, err);
      return [];
    }
  }
}
