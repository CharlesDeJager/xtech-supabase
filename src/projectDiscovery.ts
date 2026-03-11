import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { getSettings } from './settings';

export class SupabaseProjectDiscovery {
  async discover(workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined): Promise<string | undefined> {
    const settings = getSettings();

    if (settings.projectPath) {
      const configPath = path.join(settings.projectPath, 'supabase', 'config.toml');
      if (fs.existsSync(configPath)) {
        return settings.projectPath;
      }
    }

    if (!workspaceFolders || workspaceFolders.length === 0) {
      return undefined;
    }

    for (const folder of workspaceFolders) {
      const found = await this.searchForConfig(folder.uri.fsPath);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  private async searchForConfig(dirPath: string): Promise<string | undefined> {
    const configPath = path.join(dirPath, 'supabase', 'config.toml');
    if (fs.existsSync(configPath)) {
      return dirPath;
    }

    try {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
          const subPath = path.join(dirPath, entry.name);
          const found = await this.searchForConfig(subPath);
          if (found) {
            return found;
          }
        }
      }
    } catch {
      // ignore permission errors
    }

    return undefined;
  }

  async getMigrationsPath(projectRoot: string): Promise<string> {
    return path.join(projectRoot, 'supabase', 'migrations');
  }

  async getConfigPath(projectRoot: string): Promise<string> {
    return path.join(projectRoot, 'supabase', 'config.toml');
  }
}
