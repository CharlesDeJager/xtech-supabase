import * as vscode from 'vscode';
export declare class Logger {
    private static instance;
    private channel;
    private constructor();
    static getInstance(channel: vscode.OutputChannel): Logger;
    static resetInstance(): void;
    private timestamp;
    info(msg: string): void;
    warn(msg: string): void;
    error(msg: string, err?: unknown): void;
    debug(msg: string): void;
}
