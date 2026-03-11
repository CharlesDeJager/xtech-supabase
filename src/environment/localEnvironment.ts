import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../logger';
import { getSettings } from '../settings';

export class LocalEnvironment {
  private projectRoot: string;
  private logger: Logger;

  constructor(projectRoot: string, logger: Logger) {
    this.projectRoot = projectRoot;
    this.logger = logger;
  }

  async getDbUrl(): Promise<string | undefined> {
    const settings = getSettings();
    if (settings.localDbUrl) {
      return settings.localDbUrl;
    }

    try {
      const configPath = path.join(this.projectRoot, 'supabase', 'config.toml');
      const content = fs.readFileSync(configPath, 'utf-8');
      const dbPort = this.extractDbPort(content);
      if (dbPort) {
        const port = dbPort;
        return `postgresql://postgres:postgres@localhost:${port}/postgres`;
      }
      // Default Supabase local port
      return 'postgresql://postgres:postgres@localhost:54322/postgres';
    } catch (err) {
      this.logger.warn(
        `Could not read config.toml to determine DB port: ${err}`,
      );
      return 'postgresql://postgres:postgres@localhost:54322/postgres';
    }
  }

  async isRunning(): Promise<boolean> {
    try {
      await this.execCommand('supabase', ['status']);
      return true;
    } catch (err) {
      this.logger.debug(`Local Supabase services are not running: ${err}`);
      return false;
    }
  }

  async getAppliedMigrations(): Promise<string[]> {
    try {
      const output = await this.execCommand('supabase', [
        'migration',
        'list',
        '--local',
      ]);
      return this.parseMigrationListOutput(output);
    } catch (err) {
      this.logger.debug(`Could not get local migrations via CLI: ${err}`);
      return [];
    }
  }

  private parseMigrationListOutput(output: string): string[] {
    const migrations: string[] = [];
    const lines = output.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      // Skip header/separator lines
      if (
        !trimmed ||
        trimmed.startsWith('─') ||
        trimmed.startsWith('|') ||
        trimmed.startsWith('Local')
      ) {
        continue;
      }
      // Extract migration name from table rows like "  20240101000000  │  create_users  │ ..."
      const parts = trimmed.split(/\s{2,}|\t|│/);
      const name = parts[0]?.trim();
      if (name && /^\d{14}/.test(name)) {
        migrations.push(name);
      }
    }
    return migrations;
  }

  private extractDbPort(configToml: string): string | undefined {
    const dbSectionMatch = configToml.match(/\[db\]([\s\S]*?)(\n\[|$)/m);
    if (!dbSectionMatch) {
      return undefined;
    }
    const dbSection = dbSectionMatch[1];
    const portMatch = dbSection.match(/^\s*port\s*=\s*(\d+)/m);
    return portMatch?.[1];
  }

  private execCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.execFile(
        cmd,
        args,
        { cwd: this.projectRoot, timeout: 30000 },
        (err, stdout, stderr) => {
          if (err) {
            reject(
              new Error(
                `${cmd} ${args.join(' ')} failed: ${stderr || err.message}`,
              ),
            );
          } else {
            resolve(stdout);
          }
        },
      );
    });
  }
}
