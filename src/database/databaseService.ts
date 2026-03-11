import * as child_process from 'child_process';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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
  table_name: string;
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

export class DatabaseService {
  private dbUrl: string;
  private token: string | undefined;
  private logger: Logger;
  private supabase: SupabaseClient | undefined;
  private projectRoot: string | undefined;

  constructor(dbUrl: string, token: string | undefined, logger: Logger, projectRoot?: string) {
    this.dbUrl = dbUrl;
    this.token = token;
    this.logger = logger;
    this.projectRoot = projectRoot;

    if (this.isLinkedUrl(dbUrl) && token) {
      // For linked environments using Supabase JS client
      const projectUrl = this.extractProjectUrl(dbUrl);
      if (projectUrl) {
        this.supabase = createClient(projectUrl, token);
      }
    }
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
    if (this.projectRoot && !this.isLinkedUrl(this.dbUrl)) {
      return this.queryViaCli<T>(sql);
    }
    if (this.token) {
      return this.queryViaManagementApi<T>(sql);
    }
    this.logger.warn('No query method available (no CLI project root or token).');
    return [];
  }

  private async queryViaCli<T>(sql: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      child_process.execFile(
        'supabase',
        ['db', 'query', sql, '--local'],
        { cwd: this.projectRoot, timeout: 30000 },
        (err, stdout, stderr) => {
          if (err) {
            reject(new Error(`supabase db query failed: ${stderr || err.message}`));
          } else {
            try {
              const result = JSON.parse(stdout) as T[];
              resolve(result);
            } catch {
              // Try to parse as CSV or table output
              resolve([]);
            }
          }
        }
      );
    });
  }

  private async queryViaManagementApi<T>(sql: string): Promise<T[]> {
    if (!this.token) {
      return [];
    }
    const refMatch = this.dbUrl.match(/([a-z0-9]+)\.supabase\.co/);
    if (!refMatch) {
      this.logger.warn('Cannot determine project ref from DB URL for Management API.');
      return [];
    }
    const ref = refMatch[1];

    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(`Management API query failed: ${response.status} — ${body}`);
        return [];
      }

      const data = await response.json() as T[];
      return data;
    } catch (err) {
      this.logger.error('Management API query error', err);
      return [];
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
}
