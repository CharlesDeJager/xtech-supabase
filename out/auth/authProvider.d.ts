import * as vscode from 'vscode';
import { Logger } from '../logger';
export declare class AuthProvider {
    private context;
    private logger;
    constructor(context: vscode.ExtensionContext, logger: Logger);
    getToken(): Promise<string | undefined>;
    private getCliToken;
    setToken(token: string): Promise<void>;
    clearToken(): Promise<void>;
    isCliAvailable(): Promise<boolean>;
    getLinkedProjectRef(): Promise<string | undefined>;
    private execCommand;
}
