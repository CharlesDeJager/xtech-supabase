import * as vscode from 'vscode';
import {
  CONFIG_AUTH_MODE,
  CONFIG_LOCAL_DB_URL,
  CONFIG_LINKED_PROJECT_REF,
  CONFIG_PROJECT_PATH,
  CONFIG_REFRESH_INTERVAL,
  CONFIG_USE_DATA_WRANGLER,
  CONFIG_TEMP_DIRECTORY,
} from './constants';

export interface ExtensionSettings {
  projectPath: string | undefined;
  authMode: 'cli' | 'token';
  refreshInterval: number;
  localDbUrl: string | undefined;
  linkedProjectRef: string | undefined;
  useDataWrangler: boolean;
  tempDirectory?: string;
}

export function getSettings(): ExtensionSettings {
  const config = vscode.workspace.getConfiguration();

  return {
    projectPath: config.get<string>(CONFIG_PROJECT_PATH),
    authMode: config.get<'cli' | 'token'>(CONFIG_AUTH_MODE, 'cli'),
    refreshInterval: config.get<number>(CONFIG_REFRESH_INTERVAL, 0),
    localDbUrl: config.get<string>(CONFIG_LOCAL_DB_URL),
    linkedProjectRef: config.get<string>(CONFIG_LINKED_PROJECT_REF),
    useDataWrangler: config.get<boolean>(CONFIG_USE_DATA_WRANGLER, false),
    tempDirectory: config.get<string>(CONFIG_TEMP_DIRECTORY, '.supabase-temp'),
  };
}
