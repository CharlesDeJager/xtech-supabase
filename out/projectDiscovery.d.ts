import * as vscode from 'vscode';
export declare class SupabaseProjectDiscovery {
    discover(workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined): Promise<string | undefined>;
    private searchForConfig;
    getMigrationsPath(projectRoot: string): Promise<string>;
    getConfigPath(projectRoot: string): Promise<string>;
}
