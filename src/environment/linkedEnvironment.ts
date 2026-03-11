import * as child_process from 'child_process';
import { Logger } from '../logger';

export class LinkedEnvironment {
  private projectRef: string;
  private token: string | undefined;
  private logger: Logger;

  constructor(projectRef: string, token: string | undefined, logger: Logger) {
    this.projectRef = projectRef;
    this.token = token;
    this.logger = logger;
  }

  get ref(): string {
    return this.projectRef;
  }

  async getAppliedMigrations(): Promise<string[]> {
    try {
      const output = await this.execCommand('supabase', [
        'migration',
        'list',
        '--linked',
      ]);
      return this.parseMigrationListOutput(output);
    } catch (err) {
      this.logger.debug(`Could not get linked migrations via CLI: ${err}`);

      // Fallback to Management API if token is available
      if (this.token) {
        return this.getMigrationsViaApi();
      }
      return [];
    }
  }

  private async getMigrationsViaApi(): Promise<string[]> {
    if (!this.token) {
      return [];
    }
    try {
      const url = `https://api.supabase.com/v1/projects/${this.projectRef}/database/migrations`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        this.logger.warn(`Management API migrations request failed: ${response.status}`);
        return [];
      }
      const data = await response.json() as Array<{ version: string }>;
      return data.map((m) => m.version);
    } catch (err) {
      this.logger.error('Failed to fetch migrations from Management API', err);
      return [];
    }
  }

  async isLinked(): Promise<boolean> {
    try {
      const output = await this.execCommand('supabase', ['status']);
      return output.includes('Linked project ref:') || output.includes(this.projectRef);
    } catch {
      return false;
    }
  }

  private parseMigrationListOutput(output: string): string[] {
    const migrations: string[] = [];
    const lines = output.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('─') || trimmed.startsWith('|') || trimmed.startsWith('Remote')) {
        continue;
      }
      const parts = trimmed.split(/\s{2,}|\t|│/);
      const name = parts[0]?.trim();
      if (name && /^\d{14}/.test(name)) {
        migrations.push(name);
      }
    }
    return migrations;
  }

  private execCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.execFile(cmd, args, { timeout: 30000 }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`${cmd} ${args.join(' ')} failed: ${stderr || err.message}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
