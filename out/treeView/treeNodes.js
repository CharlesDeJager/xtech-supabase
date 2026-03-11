"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageBucketNode = exports.PolicyNode = exports.RoleNode = exports.IndexNode = exports.EnumNode = exports.TriggerNode = exports.FunctionNode = exports.ViewNode = exports.TableNode = exports.SchemaNode = exports.MigrationNode = exports.EmptyNode = exports.LoadingNode = exports.CategoryNode = exports.SupabaseRootNode = void 0;
const vscode = __importStar(require("vscode"));
class SupabaseRootNode extends vscode.TreeItem {
    constructor(label, connected) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.connected = connected;
        this.contextValue = `supabaseRoot-${label.toLowerCase()}`;
        this.description = connected ? 'connected' : 'disconnected';
        this.tooltip = `${label} Supabase environment — ${connected ? 'connected' : 'disconnected'}`;
        this.iconPath = new vscode.ThemeIcon(connected ? 'database' : 'debug-disconnect', connected
            ? new vscode.ThemeColor('testing.iconPassed')
            : new vscode.ThemeColor('testing.iconFailed'));
    }
}
exports.SupabaseRootNode = SupabaseRootNode;
class CategoryNode extends vscode.TreeItem {
    constructor(label, contextValue, env) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
        this.label = label;
        this.contextValue = contextValue;
        this.env = env;
        this.tooltip = `${label} (${env})`;
        this.iconPath = CategoryNode.iconForCategory(contextValue);
    }
    static iconForCategory(contextValue) {
        const map = {
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
exports.CategoryNode = CategoryNode;
class LoadingNode extends vscode.TreeItem {
    constructor() {
        super('Loading…', vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('loading~spin');
        this.contextValue = 'loading';
    }
}
exports.LoadingNode = LoadingNode;
class EmptyNode extends vscode.TreeItem {
    constructor(message = 'No items') {
        super(message, vscode.TreeItemCollapsibleState.None);
        this.iconPath = new vscode.ThemeIcon('info');
        this.contextValue = 'empty';
    }
}
exports.EmptyNode = EmptyNode;
class MigrationNode extends vscode.TreeItem {
    constructor(migration) {
        super(migration.name, vscode.TreeItemCollapsibleState.None);
        this.migration = migration;
        this.contextValue = 'migration';
        this.description = MigrationNode.statusLabel(migration);
        this.tooltip = `${migration.name}\nStatus: ${migration.status}\nFile: ${migration.filePath}`;
        this.iconPath = new vscode.ThemeIcon(MigrationNode.iconForStatus(migration.status));
        this.command = {
            command: 'vscode.open',
            title: 'Open Migration',
            arguments: [vscode.Uri.file(migration.filePath)],
        };
    }
    static statusLabel(m) {
        switch (m.status) {
            case 'applied-both': return '✓ local + linked';
            case 'applied-local': return '✓ local only';
            case 'applied-linked': return '✓ linked only';
            case 'pending': return '⏳ pending';
        }
    }
    static iconForStatus(status) {
        switch (status) {
            case 'applied-both': return 'pass-filled';
            case 'applied-local': return 'pass';
            case 'applied-linked': return 'circle-outline';
            case 'pending': return 'clock';
        }
    }
}
exports.MigrationNode = MigrationNode;
class SchemaNode extends vscode.TreeItem {
    constructor(schemaName, env) {
        super(schemaName, vscode.TreeItemCollapsibleState.None);
        this.schemaName = schemaName;
        this.env = env;
        this.contextValue = `schema-${env}`;
        this.tooltip = `Schema: ${schemaName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('symbol-namespace');
    }
}
exports.SchemaNode = SchemaNode;
class TableNode extends vscode.TreeItem {
    constructor(tableName, schema, env) {
        super(tableName, vscode.TreeItemCollapsibleState.None);
        this.tableName = tableName;
        this.schema = schema;
        this.env = env;
        this.contextValue = `table-${env}`;
        this.description = schema;
        this.tooltip = `Table: ${schema}.${tableName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('table');
    }
}
exports.TableNode = TableNode;
class ViewNode extends vscode.TreeItem {
    constructor(viewName, schema, env) {
        super(viewName, vscode.TreeItemCollapsibleState.None);
        this.viewName = viewName;
        this.schema = schema;
        this.env = env;
        this.contextValue = `view-${env}`;
        this.description = schema;
        this.tooltip = `View: ${schema}.${viewName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('symbol-class');
    }
}
exports.ViewNode = ViewNode;
class FunctionNode extends vscode.TreeItem {
    constructor(functionName, schema, returnType, env) {
        super(functionName, vscode.TreeItemCollapsibleState.None);
        this.functionName = functionName;
        this.schema = schema;
        this.returnType = returnType;
        this.env = env;
        this.contextValue = `function-${env}`;
        this.description = `${schema} → ${returnType}`;
        this.tooltip = `Function: ${schema}.${functionName}() → ${returnType} (${env})`;
        this.iconPath = new vscode.ThemeIcon('symbol-method');
    }
}
exports.FunctionNode = FunctionNode;
class TriggerNode extends vscode.TreeItem {
    constructor(triggerName, tableName, event, env) {
        super(triggerName, vscode.TreeItemCollapsibleState.None);
        this.triggerName = triggerName;
        this.tableName = tableName;
        this.event = event;
        this.env = env;
        this.contextValue = `trigger-${env}`;
        this.description = `${tableName} [${event}]`;
        this.tooltip = `Trigger: ${triggerName} on ${tableName} (${event}) (${env})`;
        this.iconPath = new vscode.ThemeIcon('zap');
    }
}
exports.TriggerNode = TriggerNode;
class EnumNode extends vscode.TreeItem {
    constructor(typeName, schema, values, env) {
        super(typeName, vscode.TreeItemCollapsibleState.None);
        this.typeName = typeName;
        this.schema = schema;
        this.values = values;
        this.env = env;
        this.contextValue = `enum-${env}`;
        this.description = schema;
        this.tooltip = `Enum: ${schema}.${typeName}\nValues: ${values.join(', ')} (${env})`;
        this.iconPath = new vscode.ThemeIcon('symbol-enum');
    }
}
exports.EnumNode = EnumNode;
class IndexNode extends vscode.TreeItem {
    constructor(indexName, tableName, schema, env) {
        super(indexName, vscode.TreeItemCollapsibleState.None);
        this.indexName = indexName;
        this.tableName = tableName;
        this.schema = schema;
        this.env = env;
        this.contextValue = `index-${env}`;
        this.description = `${schema}.${tableName}`;
        this.tooltip = `Index: ${indexName} on ${schema}.${tableName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('key');
    }
}
exports.IndexNode = IndexNode;
class RoleNode extends vscode.TreeItem {
    constructor(roleName, env) {
        super(roleName, vscode.TreeItemCollapsibleState.None);
        this.roleName = roleName;
        this.env = env;
        this.contextValue = `role-${env}`;
        this.tooltip = `Role: ${roleName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('person');
    }
}
exports.RoleNode = RoleNode;
class PolicyNode extends vscode.TreeItem {
    constructor(policyName, tableName, schema, env) {
        super(policyName, vscode.TreeItemCollapsibleState.None);
        this.policyName = policyName;
        this.tableName = tableName;
        this.schema = schema;
        this.env = env;
        this.contextValue = `policy-${env}`;
        this.description = `${schema}.${tableName}`;
        this.tooltip = `Policy: ${policyName} on ${schema}.${tableName} (${env})`;
        this.iconPath = new vscode.ThemeIcon('shield');
    }
}
exports.PolicyNode = PolicyNode;
class StorageBucketNode extends vscode.TreeItem {
    constructor(bucketId, bucketName, isPublic, env) {
        super(bucketName, vscode.TreeItemCollapsibleState.None);
        this.bucketId = bucketId;
        this.bucketName = bucketName;
        this.isPublic = isPublic;
        this.env = env;
        this.contextValue = `storageBucket-${env}`;
        this.description = isPublic ? 'public' : 'private';
        this.tooltip = `Bucket: ${bucketName} (${isPublic ? 'public' : 'private'}) (${env})`;
        this.iconPath = new vscode.ThemeIcon('archive');
    }
}
exports.StorageBucketNode = StorageBucketNode;
//# sourceMappingURL=treeNodes.js.map