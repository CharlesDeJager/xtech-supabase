import * as vscode from 'vscode';

export class Logger {
  private static instance: Logger | undefined;
  private channel: vscode.OutputChannel;

  private constructor(channel: vscode.OutputChannel) {
    this.channel = channel;
  }

  static getInstance(channel: vscode.OutputChannel): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(channel);
    }
    return Logger.instance;
  }

  static resetInstance(): void {
    Logger.instance = undefined;
  }

  private timestamp(): string {
    return new Date().toISOString();
  }

  info(msg: string): void {
    this.channel.appendLine(`[INFO  ${this.timestamp()}] ${msg}`);
  }

  warn(msg: string): void {
    this.channel.appendLine(`[WARN  ${this.timestamp()}] ${msg}`);
  }

  error(msg: string, err?: unknown): void {
    const errStr = err instanceof Error ? ` — ${err.message}` : err ? ` — ${String(err)}` : '';
    this.channel.appendLine(`[ERROR ${this.timestamp()}] ${msg}${errStr}`);
  }

  debug(msg: string): void {
    this.channel.appendLine(`[DEBUG ${this.timestamp()}] ${msg}`);
  }
}
