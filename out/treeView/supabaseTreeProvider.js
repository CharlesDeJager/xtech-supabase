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
exports.SupabaseTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const treeNodes_1 = require("./treeNodes");
class SupabaseTreeProvider {
    constructor(logger, migrationService, localDb, linkedDb, localConnected = false, linkedConnected = false) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.cache = new Map();
        this.logger = logger;
        this.migrationService = migrationService;
        this.localDb = localDb;
        this.linkedDb = linkedDb;
        this.localConnected = localConnected;
        this.linkedConnected = linkedConnected;
    }
    setServices(migrationService, localDb, linkedDb, localConnected, linkedConnected) {
        this.migrationService = migrationService;
        this.localDb = localDb;
        this.linkedDb = linkedDb;
        this.localConnected = localConnected;
        this.linkedConnected = linkedConnected;
    }
    refresh() {
        this.cache.clear();
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return [
                new treeNodes_1.SupabaseRootNode('Local', this.localConnected),
                new treeNodes_1.SupabaseRootNode('Linked', this.linkedConnected),
            ];
        }
        if (element instanceof treeNodes_1.SupabaseRootNode) {
            return this.getRootChildren(element);
        }
        if (element instanceof treeNodes_1.CategoryNode) {
            return this.getCategoryChildren(element);
        }
        return [];
    }
    getRootChildren(node) {
        const env = node.label.toLowerCase();
        const categories = [
            'migrations',
            'schemas',
            'tables',
            'views',
            'functions',
            'triggers',
            'enums',
            'indexes',
            'roles',
            'policies',
            'storage',
        ];
        return categories.map((cat) => new treeNodes_1.CategoryNode(cat.charAt(0).toUpperCase() + cat.slice(1), cat, env));
    }
    getCategoryChildren(node) {
        const cacheKey = `${node.env}-${node.contextValue}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        // Return loading placeholder and trigger async load
        this.loadCategoryAsync(node, cacheKey);
        return [new treeNodes_1.LoadingNode()];
    }
    async loadCategoryAsync(node, cacheKey) {
        try {
            const items = await this.fetchCategoryItems(node);
            this.cache.set(cacheKey, items.length > 0 ? items : [new treeNodes_1.EmptyNode()]);
        }
        catch (err) {
            this.logger.error(`Failed to load ${node.contextValue} for ${node.env}`, err);
            this.cache.set(cacheKey, [new treeNodes_1.EmptyNode('Error loading data')]);
        }
        this._onDidChangeTreeData.fire(node);
    }
    async fetchCategoryItems(node) {
        const env = node.env;
        const db = env === 'local' ? this.localDb : this.linkedDb;
        const cat = node.contextValue;
        switch (cat) {
            case 'migrations': {
                if (!this.migrationService) {
                    return [];
                }
                const migrations = await this.migrationService.listMigrations();
                return migrations.map((m) => new treeNodes_1.MigrationNode(m));
            }
            case 'schemas': {
                if (!db) {
                    return [];
                }
                const schemas = await db.getSchemas();
                return schemas.map((s) => new treeNodes_1.SchemaNode(s.schema_name, env));
            }
            case 'tables': {
                if (!db) {
                    return [];
                }
                const tables = await db.getTables('public');
                return tables.map((t) => new treeNodes_1.TableNode(t.table_name, t.schema, env));
            }
            case 'views': {
                if (!db) {
                    return [];
                }
                const views = await db.getViews('public');
                return views.map((v) => new treeNodes_1.ViewNode(v.view_name, v.schema, env));
            }
            case 'functions': {
                if (!db) {
                    return [];
                }
                const fns = await db.getFunctions('public');
                return fns.map((f) => new treeNodes_1.FunctionNode(f.function_name, f.schema, f.return_type, env));
            }
            case 'triggers': {
                if (!db) {
                    return [];
                }
                const triggers = await db.getTriggers();
                return triggers.map((t) => new treeNodes_1.TriggerNode(t.trigger_name, t.table_name, t.event, env));
            }
            case 'enums': {
                if (!db) {
                    return [];
                }
                const enums = await db.getEnums();
                return enums.map((e) => new treeNodes_1.EnumNode(e.type_name, e.schema, e.values, env));
            }
            case 'indexes': {
                if (!db) {
                    return [];
                }
                const indexes = await db.getIndexes();
                return indexes.map((i) => new treeNodes_1.IndexNode(i.index_name, i.table_name, i.schema, env));
            }
            case 'roles': {
                if (!db) {
                    return [];
                }
                const roles = await db.getRoles();
                return roles.map((r) => new treeNodes_1.RoleNode(r.role_name, env));
            }
            case 'policies': {
                if (!db) {
                    return [];
                }
                const policies = await db.getPolicies();
                return policies.map((p) => new treeNodes_1.PolicyNode(p.policy_name, p.table_name, p.schema, env));
            }
            case 'storage': {
                if (!db) {
                    return [];
                }
                const buckets = await db.getStorageBuckets();
                return buckets.map((b) => new treeNodes_1.StorageBucketNode(b.id, b.name, b.public, env));
            }
            default:
                return [];
        }
    }
}
exports.SupabaseTreeProvider = SupabaseTreeProvider;
//# sourceMappingURL=supabaseTreeProvider.js.map