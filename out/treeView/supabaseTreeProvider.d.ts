import * as vscode from 'vscode';
import { MigrationService } from '../migrations/migrationService';
import { DatabaseService } from '../database/databaseService';
import { Logger } from '../logger';
type AnyTreeItem = vscode.TreeItem;
export declare class SupabaseTreeProvider implements vscode.TreeDataProvider<AnyTreeItem> {
    private _onDidChangeTreeData;
    readonly onDidChangeTreeData: vscode.Event<void | vscode.TreeItem | null | undefined>;
    private cache;
    private migrationService;
    private localDb;
    private linkedDb;
    private logger;
    private localConnected;
    private linkedConnected;
    constructor(logger: Logger, migrationService?: MigrationService, localDb?: DatabaseService, linkedDb?: DatabaseService, localConnected?: boolean, linkedConnected?: boolean);
    setServices(migrationService: MigrationService, localDb: DatabaseService | undefined, linkedDb: DatabaseService | undefined, localConnected: boolean, linkedConnected: boolean): void;
    refresh(): void;
    getTreeItem(element: AnyTreeItem): vscode.TreeItem;
    getChildren(element?: AnyTreeItem): vscode.ProviderResult<AnyTreeItem[]>;
    private getRootChildren;
    private getCategoryChildren;
    private loadCategoryAsync;
    private fetchCategoryItems;
}
export {};
