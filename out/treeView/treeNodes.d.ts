import * as vscode from 'vscode';
import { Migration } from '../migrations/migrationModel';
export declare class SupabaseRootNode extends vscode.TreeItem {
    readonly label: 'Local' | 'Linked';
    readonly connected: boolean;
    constructor(label: 'Local' | 'Linked', connected: boolean);
}
export declare class CategoryNode extends vscode.TreeItem {
    readonly label: string;
    readonly contextValue: string;
    readonly env: 'local' | 'linked';
    constructor(label: string, contextValue: string, env: 'local' | 'linked');
    private static iconForCategory;
}
export declare class LoadingNode extends vscode.TreeItem {
    constructor();
}
export declare class EmptyNode extends vscode.TreeItem {
    constructor(message?: string);
}
export declare class MigrationNode extends vscode.TreeItem {
    readonly migration: Migration;
    constructor(migration: Migration);
    private static statusLabel;
    private static iconForStatus;
}
export declare class SchemaNode extends vscode.TreeItem {
    readonly schemaName: string;
    readonly env: 'local' | 'linked';
    constructor(schemaName: string, env: 'local' | 'linked');
}
export declare class TableNode extends vscode.TreeItem {
    readonly tableName: string;
    readonly schema: string;
    readonly env: 'local' | 'linked';
    constructor(tableName: string, schema: string, env: 'local' | 'linked');
}
export declare class ViewNode extends vscode.TreeItem {
    readonly viewName: string;
    readonly schema: string;
    readonly env: 'local' | 'linked';
    constructor(viewName: string, schema: string, env: 'local' | 'linked');
}
export declare class FunctionNode extends vscode.TreeItem {
    readonly functionName: string;
    readonly schema: string;
    readonly returnType: string;
    readonly env: 'local' | 'linked';
    constructor(functionName: string, schema: string, returnType: string, env: 'local' | 'linked');
}
export declare class TriggerNode extends vscode.TreeItem {
    readonly triggerName: string;
    readonly tableName: string;
    readonly event: string;
    readonly env: 'local' | 'linked';
    constructor(triggerName: string, tableName: string, event: string, env: 'local' | 'linked');
}
export declare class EnumNode extends vscode.TreeItem {
    readonly typeName: string;
    readonly schema: string;
    readonly values: string[];
    readonly env: 'local' | 'linked';
    constructor(typeName: string, schema: string, values: string[], env: 'local' | 'linked');
}
export declare class IndexNode extends vscode.TreeItem {
    readonly indexName: string;
    readonly tableName: string;
    readonly schema: string;
    readonly env: 'local' | 'linked';
    constructor(indexName: string, tableName: string, schema: string, env: 'local' | 'linked');
}
export declare class RoleNode extends vscode.TreeItem {
    readonly roleName: string;
    readonly env: 'local' | 'linked';
    constructor(roleName: string, env: 'local' | 'linked');
}
export declare class PolicyNode extends vscode.TreeItem {
    readonly policyName: string;
    readonly tableName: string;
    readonly schema: string;
    readonly env: 'local' | 'linked';
    constructor(policyName: string, tableName: string, schema: string, env: 'local' | 'linked');
}
export declare class StorageBucketNode extends vscode.TreeItem {
    readonly bucketId: string;
    readonly bucketName: string;
    readonly isPublic: boolean;
    readonly env: 'local' | 'linked';
    constructor(bucketId: string, bucketName: string, isPublic: boolean, env: 'local' | 'linked');
}
