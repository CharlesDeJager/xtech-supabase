export const EXTENSION_ID = 'xtech-supabase';
export const OUTPUT_CHANNEL_NAME = 'XTECH Supabase';
export const VIEW_ID = 'xtech-supabase.supabaseExplorer';

export enum Commands {
  Refresh = 'xtech-supabase.refresh',
  CreateMigration = 'xtech-supabase.createMigration',
  SetToken = 'xtech-supabase.setToken',
  ClearToken = 'xtech-supabase.clearToken',
  ViewTableSchema = 'xtech-supabase.viewTableSchema',
  ViewTableData = 'xtech-supabase.viewTableData',
  ViewViewSchema = 'xtech-supabase.viewViewSchema',
  ViewViewData = 'xtech-supabase.viewViewData',
  ViewFunctionDetails = 'xtech-supabase.viewFunctionDetails',
  ViewPolicyDetails = 'xtech-supabase.viewPolicyDetails',
  ViewTriggerDetails = 'xtech-supabase.viewTriggerDetails',
  ViewIndexDetails = 'xtech-supabase.viewIndexDetails',
  ViewRoleDetails = 'xtech-supabase.viewRoleDetails',
  ViewStorageBucketDetails = 'xtech-supabase.viewStorageBucketDetails',
  CopySqlTable = 'xtech-supabase.copySqlTable',
  CopySqlView = 'xtech-supabase.copySqlView',
  CopySqlFunction = 'xtech-supabase.copySqlFunction',
  CopySqlPolicy = 'xtech-supabase.copySqlPolicy',
  CopySqlTrigger = 'xtech-supabase.copySqlTrigger',
  CopySqlIndex = 'xtech-supabase.copySqlIndex',
  CopySqlRole = 'xtech-supabase.copySqlRole',
  CopySqlStorageBucket = 'xtech-supabase.copySqlStorageBucket',
}

export const CONFIG_PROJECT_PATH = 'xtech-supabase.projectPath';
export const CONFIG_AUTH_MODE = 'xtech-supabase.authMode';
export const CONFIG_REFRESH_INTERVAL = 'xtech-supabase.refreshInterval';
export const CONFIG_LOCAL_DB_URL = 'xtech-supabase.localDbUrl';
export const CONFIG_LINKED_PROJECT_REF = 'xtech-supabase.linkedProjectRef';

export const SECRET_TOKEN_KEY = 'xtech-supabase.token';
