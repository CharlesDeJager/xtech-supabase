import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { Logger } from '../logger';
import { getSettings } from '../settings';
import { SECRET_TOKEN_KEY } from '../constants';

export class AuthProvider {
  private context: vscode.ExtensionContext;
  private logger: Logger;

  constructor(context: vscode.ExtensionContext, logger: Logger) {
    this.context = context;
    this.logger = logger;
  }

  async getToken(): Promise<string | undefined> {
    const settings = getSettings();
    const storedToken = this.normalizeToken(
      await this.context.secrets.get(SECRET_TOKEN_KEY),
    );

    if (settings.authMode === 'token') {
      if (!storedToken) {
        this.logger.warn(
          'Auth mode is "token" but no token found in SecretStorage.',
        );
      }
      return storedToken;
    }

    // cli mode: prefer CLI/env-derived token, then fall back to SecretStorage.
    const cliToken = await this.getCliToken();
    if (cliToken) {
      return cliToken;
    }

    if (storedToken) {
      this.logger.debug(
        'Using SecretStorage token fallback while in CLI auth mode.',
      );
      return storedToken;
    }

    this.logger.warn(
      'CLI is authenticated, but no access token was found in environment, CLI token files, or SecretStorage. Linked object browsing may be unavailable.',
    );
    return undefined;
  }

  private async getCliToken(): Promise<string | undefined> {
    try {
      const output = await this.execCommand('supabase', [
        'projects',
        'list',
        '--output',
        'json',
      ]);
      // If the command succeeds, the CLI is authenticated. Try to resolve
      // the access token so linked Management API queries can run.
      this.logger.debug(
        `supabase projects list succeeded: ${output.substring(0, 100)}`,
      );

      const envToken = process.env.SUPABASE_ACCESS_TOKEN;
      if (envToken) {
        return this.normalizeToken(envToken);
      }

      const home = process.env.HOME;
      if (home) {
        const tokenPaths = [
          path.join(home, '.supabase', 'access-token'),
          path.join(home, '.config', 'supabase', 'access-token'),
        ];

        for (const tokenPath of tokenPaths) {
          if (fs.existsSync(tokenPath)) {
            const fileToken = this.normalizeToken(
              fs.readFileSync(tokenPath, 'utf-8'),
            );
            if (fileToken) {
              return fileToken;
            }
          }
        }
      }

      return undefined;
    } catch (err) {
      this.logger.debug(`CLI auth not available: ${err}`);
      return undefined;
    }
  }

  async setToken(token: string): Promise<void> {
    const normalized = this.normalizeToken(token);
    if (!normalized) {
      this.logger.warn('Provided token is empty after normalization.');
      return;
    }
    await this.context.secrets.store(SECRET_TOKEN_KEY, normalized);
    this.logger.info('Supabase access token stored in SecretStorage.');
  }

  async clearToken(): Promise<void> {
    await this.context.secrets.delete(SECRET_TOKEN_KEY);
    this.logger.info('Supabase access token cleared from SecretStorage.');
  }

  async isCliAvailable(): Promise<boolean> {
    try {
      await this.execCommand('supabase', ['--version']);
      return true;
    } catch {
      return false;
    }
  }

  async getLinkedProjectRef(projectRoot?: string): Promise<string | undefined> {
    const settings = getSettings();
    if (settings.linkedProjectRef) {
      return settings.linkedProjectRef;
    }

    try {
      const output = await this.execCommand('supabase', [
        'status',
        '--output',
        'json',
      ]);
      const data = JSON.parse(output) as Record<string, unknown>;
      if (data && typeof data['project_ref'] === 'string') {
        return data['project_ref'];
      }
    } catch (err) {
      this.logger.debug(`Could not get linked project ref from CLI: ${err}`);
    }

    if (projectRoot) {
      const refFromConfig = this.getLinkedProjectRefFromConfig(projectRoot);
      if (refFromConfig) {
        this.logger.debug(
          `Linked project ref from config.toml: ${refFromConfig}`,
        );
        return refFromConfig;
      }
    }

    return undefined;
  }

  private getLinkedProjectRefFromConfig(
    projectRoot: string,
  ): string | undefined {
    try {
      const configPath = path.join(projectRoot, 'supabase', 'config.toml');
      const content = fs.readFileSync(configPath, 'utf-8');
      const match = content.match(/^\s*project_id\s*=\s*"([a-z0-9-]+)"\s*$/m);
      return match?.[1];
    } catch {
      return undefined;
    }
  }

  private execCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.execFile(
        cmd,
        args,
        { timeout: 15000 },
        (err, stdout, stderr) => {
          if (err) {
            reject(
              new Error(
                `Command failed: ${cmd} ${args.join(' ')} — ${stderr || err.message}`,
              ),
            );
          } else {
            resolve(stdout);
          }
        },
      );
    });
  }

  private normalizeToken(token: string | undefined): string | undefined {
    if (!token) {
      return undefined;
    }

    let value = token.trim();
    value = value.replace(/^Bearer\s+/i, '');
    value = value.replace(/^['"]+|['"]+$/g, '');
    value = value.trim();

    return value || undefined;
  }
}
