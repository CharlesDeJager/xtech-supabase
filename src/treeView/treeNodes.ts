import * as vscode from 'vscode';
import { Migration } from '../migrations/migrationModel';

export class SupabaseRootNode extends vscode.TreeItem {
  constructor(
    public readonly label: 'Local' | 'Linked',
    public readonly connected: boolean,
  ) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = `supabaseRoot-${label.toLowerCase()}`;
    this.description = connected ? 'connected' : 'disconnected';
    this.tooltip = `${label} Supabase environment — ${connected ? 'connected' : 'disconnected'}`;
    this.iconPath = new vscode.ThemeIcon(
      connected ? 'database' : 'debug-disconnect',
      connected
        ? new vscode.ThemeColor('testing.iconPassed')
        : new vscode.ThemeColor('testing.iconFailed'),
    );
  }
}

export class CategoryNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly contextValue: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `${label} (${env})`;
    this.iconPath = CategoryNode.iconForCategory(contextValue);
  }

  private static iconForCategory(contextValue: string): vscode.ThemeIcon {
    const map: Record<string, string> = {
      migrations: 'list-ordered',
      schemas: 'symbol-namespace',
      tables: 'table',
      views: 'symbol-class',
      functions: 'symbol-method',
      triggers: 'zap',
      enums: 'symbol-enum',
      indexes: 'key',
      roles: 'person',
      policies: 'shield',
      storage: 'archive',
    };
    return new vscode.ThemeIcon(map[contextValue] ?? 'symbol-misc');
  }
}

export class LoadingNode extends vscode.TreeItem {
  constructor() {
    super('Loading…', vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('loading~spin');
    this.contextValue = 'loading';
  }
}

export class EmptyNode extends vscode.TreeItem {
  constructor(message = 'No items') {
    super(message, vscode.TreeItemCollapsibleState.None);
    this.iconPath = new vscode.ThemeIcon('info');
    this.contextValue = 'empty';
  }
}

export class MigrationNode extends vscode.TreeItem {
  constructor(public readonly migration: Migration) {
    super(migration.name, vscode.TreeItemCollapsibleState.None);
    this.contextValue = 'migration';
    this.description = MigrationNode.statusLabel(migration);
    this.tooltip = `${migration.name}\nStatus: ${migration.status}\nFile: ${migration.filePath}`;
    this.iconPath = new vscode.ThemeIcon(
      MigrationNode.iconForStatus(migration.status),
    );
    this.command = {
      command: 'vscode.open',
      title: 'Open Migration',
      arguments: [vscode.Uri.file(migration.filePath)],
    };
  }

  private static statusLabel(m: Migration): string {
    switch (m.status) {
      case 'applied-both':
        return '✓ local + linked';
      case 'applied-local':
        return '✓ local only';
      case 'applied-linked':
        return '✓ linked only';
      case 'pending':
        return '⏳ pending';
    }
  }

  private static iconForStatus(status: Migration['status']): string {
    switch (status) {
      case 'applied-both':
        return 'pass-filled';
      case 'applied-local':
        return 'pass';
      case 'applied-linked':
        return 'circle-outline';
      case 'pending':
        return 'clock';
    }
  }
}

export class SchemaNode extends vscode.TreeItem {
  constructor(
    public readonly schemaName: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(schemaName, vscode.TreeItemCollapsibleState.Collapsed);
    this.contextValue = `schema-${env}`;
    this.tooltip = `Schema: ${schemaName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('symbol-namespace');
  }
}

export class SchemaObjectGroupNode extends vscode.TreeItem {
  constructor(
    public readonly group: 'tables' | 'views',
    public readonly schemaName: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(
      group === 'tables' ? 'Tables' : 'Views',
      vscode.TreeItemCollapsibleState.Collapsed,
    );
    this.contextValue = `schemaGroup-${group}-${env}`;
    this.tooltip = `${this.label} in schema ${schemaName} (${env})`;
    this.iconPath = new vscode.ThemeIcon(
      group === 'tables' ? 'table' : 'symbol-class',
    );
  }
}

export class TableNode extends vscode.TreeItem {
  constructor(
    public readonly tableName: string,
    public readonly schema: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(tableName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `table-${env}`;
    this.description = schema;
    this.tooltip = `Table: ${schema}.${tableName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('table');
  }
}

export class ViewNode extends vscode.TreeItem {
  constructor(
    public readonly viewName: string,
    public readonly schema: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(viewName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `view-${env}`;
    this.description = schema;
    this.tooltip = `View: ${schema}.${viewName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('symbol-class');
  }
}

export class FunctionNode extends vscode.TreeItem {
  constructor(
    public readonly functionName: string,
    public readonly schema: string,
    public readonly returnType: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(functionName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `function-${env}`;
    this.description = `${schema} → ${returnType}`;
    this.tooltip = `Function: ${schema}.${functionName}() → ${returnType} (${env})`;
    this.iconPath = new vscode.ThemeIcon('symbol-method');
  }
}

export class TriggerNode extends vscode.TreeItem {
  constructor(
    public readonly triggerName: string,
    public readonly tableName: string,
    public readonly event: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(triggerName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `trigger-${env}`;
    this.description = `${tableName} [${event}]`;
    this.tooltip = `Trigger: ${triggerName} on ${tableName} (${event}) (${env})`;
    this.iconPath = new vscode.ThemeIcon('zap');
  }
}

export class EnumNode extends vscode.TreeItem {
  constructor(
    public readonly typeName: string,
    public readonly schema: string,
    public readonly values: string[],
    public readonly env: 'local' | 'linked',
  ) {
    super(typeName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `enum-${env}`;
    this.description = schema;
    this.tooltip = `Enum: ${schema}.${typeName}\nValues: ${values.join(', ')} (${env})`;
    this.iconPath = new vscode.ThemeIcon('symbol-enum');
  }
}

export class IndexNode extends vscode.TreeItem {
  constructor(
    public readonly indexName: string,
    public readonly tableName: string,
    public readonly schema: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(indexName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `index-${env}`;
    this.description = `${schema}.${tableName}`;
    this.tooltip = `Index: ${indexName} on ${schema}.${tableName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('key');
  }
}

export class RoleNode extends vscode.TreeItem {
  constructor(
    public readonly roleName: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(roleName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `role-${env}`;
    this.tooltip = `Role: ${roleName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('person');
  }
}

export class PolicyNode extends vscode.TreeItem {
  constructor(
    public readonly policyName: string,
    public readonly tableName: string,
    public readonly schema: string,
    public readonly env: 'local' | 'linked',
  ) {
    super(policyName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `policy-${env}`;
    this.description = `${schema}.${tableName}`;
    this.tooltip = `Policy: ${policyName} on ${schema}.${tableName} (${env})`;
    this.iconPath = new vscode.ThemeIcon('shield');
  }
}

export class StorageBucketNode extends vscode.TreeItem {
  constructor(
    public readonly bucketId: string,
    public readonly bucketName: string,
    public readonly isPublic: boolean,
    public readonly env: 'local' | 'linked',
  ) {
    super(bucketName, vscode.TreeItemCollapsibleState.None);
    this.contextValue = `storageBucket-${env}`;
    this.description = isPublic ? 'public' : 'private';
    this.tooltip = `Bucket: ${bucketName} (${isPublic ? 'public' : 'private'}) (${env})`;
    this.iconPath = new vscode.ThemeIcon('archive');
  }
}
