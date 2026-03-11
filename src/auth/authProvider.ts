import * as child_process from 'child_process';
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

    if (settings.authMode === 'token') {
      const token = await this.context.secrets.get(SECRET_TOKEN_KEY);
      if (!token) {
        this.logger.warn('Auth mode is "token" but no token found in SecretStorage.');
      }
      return token;
    }

    // cli mode: try to extract token from supabase status
    return this.getCliToken();
  }

  private async getCliToken(): Promise<string | undefined> {
    try {
      const output = await this.execCommand('supabase', ['projects', 'list', '--json']);
      // If the command succeeds, the CLI is authenticated; return a sentinel or undefined
      // The CLI manages its own auth; token-based queries aren't used in cli mode
      this.logger.debug(`supabase projects list succeeded: ${output.substring(0, 100)}`);
      return undefined;
    } catch (err) {
      this.logger.debug(`CLI auth not available: ${err}`);
      return undefined;
    }
  }

  async setToken(token: string): Promise<void> {
    await this.context.secrets.store(SECRET_TOKEN_KEY, token);
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

  async getLinkedProjectRef(): Promise<string | undefined> {
    const settings = getSettings();
    if (settings.linkedProjectRef) {
      return settings.linkedProjectRef;
    }

    try {
      const output = await this.execCommand('supabase', ['status', '--output', 'json']);
      const data = JSON.parse(output) as Record<string, unknown>;
      if (data && typeof data['project_ref'] === 'string') {
        return data['project_ref'];
      }
      return undefined;
    } catch (err) {
      this.logger.debug(`Could not get linked project ref from CLI: ${err}`);
      return undefined;
    }
  }

  private execCommand(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      child_process.execFile(cmd, args, { timeout: 15000 }, (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`Command failed: ${cmd} ${args.join(' ')} — ${stderr || err.message}`));
        } else {
          resolve(stdout);
        }
      });
    });
  }
}
