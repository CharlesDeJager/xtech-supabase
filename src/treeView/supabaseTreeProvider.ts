import * as vscode from 'vscode';
import { MigrationService } from '../migrations/migrationService';
import { DatabaseService } from '../database/databaseService';
import {
  SupabaseRootNode,
  CategoryNode,
  LoadingNode,
  EmptyNode,
  MigrationNode,
  SchemaNode,
  SchemaObjectGroupNode,
  TableNode,
  ViewNode,
  FunctionNode,
  TriggerNode,
  EnumNode,
  IndexNode,
  RoleNode,
  PolicyNode,
  StorageBucketNode,
} from './treeNodes';
import { Logger } from '../logger';

type AnyTreeItem = vscode.TreeItem;

export class SupabaseTreeProvider implements vscode.TreeDataProvider<AnyTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<
    AnyTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private cache = new Map<string, AnyTreeItem[]>();
  private migrationService: MigrationService | undefined;
  private localDb: DatabaseService | undefined;
  private linkedDb: DatabaseService | undefined;
  private logger: Logger;
  private localConnected: boolean;
  private linkedConnected: boolean;

  constructor(
    logger: Logger,
    migrationService?: MigrationService,
    localDb?: DatabaseService,
    linkedDb?: DatabaseService,
    localConnected = false,
    linkedConnected = false,
  ) {
    this.logger = logger;
    this.migrationService = migrationService;
    this.localDb = localDb;
    this.linkedDb = linkedDb;
    this.localConnected = localConnected;
    this.linkedConnected = linkedConnected;
  }

  setServices(
    migrationService: MigrationService | undefined,
    localDb: DatabaseService | undefined,
    linkedDb: DatabaseService | undefined,
    localConnected: boolean,
    linkedConnected: boolean,
  ): void {
    this.migrationService = migrationService;
    this.localDb = localDb;
    this.linkedDb = linkedDb;
    this.localConnected = localConnected;
    this.linkedConnected = linkedConnected;
  }

  refresh(): void {
    this.cache.clear();
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AnyTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: AnyTreeItem): vscode.ProviderResult<AnyTreeItem[]> {
    if (!element) {
      return [
        new SupabaseRootNode('Local', this.localConnected),
        new SupabaseRootNode('Linked', this.linkedConnected),
      ];
    }

    if (element instanceof SupabaseRootNode) {
      return this.getRootChildren(element);
    }

    if (element instanceof CategoryNode) {
      return this.getCategoryChildren(element);
    }

    if (element instanceof SchemaNode) {
      return this.getSchemaChildren(element);
    }

    if (element instanceof SchemaObjectGroupNode) {
      return this.getSchemaObjectGroupChildren(element);
    }

    return [];
  }

  private getRootChildren(node: SupabaseRootNode): AnyTreeItem[] {
    const env = node.label.toLowerCase() as 'local' | 'linked';
    const items: AnyTreeItem[] = [];

    if (env === 'linked' && this.linkedConnected && !this.linkedDb) {
      items.push(
        new EmptyNode(
          'Linked project detected but query auth is unavailable. Set Supabase Access Token.',
        ),
      );
    }

    const categories = [
      'migrations',
      'schemas',
      'functions',
      'triggers',
      'enums',
      'indexes',
      'roles',
      'policies',
      'storage',
    ];

    return [
      ...items,
      ...categories.map(
        (cat) =>
          new CategoryNode(
            cat.charAt(0).toUpperCase() + cat.slice(1),
            cat,
            env,
          ),
      ),
    ];
  }

  private getCategoryChildren(
    node: CategoryNode,
  ): vscode.ProviderResult<AnyTreeItem[]> {
    const cacheKey = `${node.env}-${node.contextValue}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Return loading placeholder and trigger async load
    this.loadCategoryAsync(node, cacheKey);
    return [new LoadingNode()];
  }

  private getSchemaChildren(node: SchemaNode): AnyTreeItem[] {
    return [
      new SchemaObjectGroupNode('tables', node.schemaName, node.env),
      new SchemaObjectGroupNode('views', node.schemaName, node.env),
    ];
  }

  private async getSchemaObjectGroupChildren(
    node: SchemaObjectGroupNode,
  ): Promise<AnyTreeItem[]> {
    const db = node.env === 'local' ? this.localDb : this.linkedDb;
    if (!db) {
      return [new EmptyNode()];
    }

    if (node.group === 'tables') {
      const tables = await db.getTables(node.schemaName);
      return tables.length > 0
        ? tables.map((t) => new TableNode(t.table_name, t.schema, node.env))
        : [new EmptyNode()];
    }

    const views = await db.getViews(node.schemaName);
    return views.length > 0
      ? views.map((v) => new ViewNode(v.view_name, v.schema, node.env))
      : [new EmptyNode()];
  }

  private async loadCategoryAsync(
    node: CategoryNode,
    cacheKey: string,
  ): Promise<void> {
    try {
      const items = await this.fetchCategoryItems(node);
      this.cache.set(cacheKey, items.length > 0 ? items : [new EmptyNode()]);
    } catch (err) {
      this.logger.error(
        `Failed to load ${node.contextValue} for ${node.env}`,
        err,
      );
      this.cache.set(cacheKey, [new EmptyNode('Error loading data')]);
    }
    // Node instances are recreated during tree expansion; fire a full refresh
    // so loading placeholders are reliably replaced with cached results.
    this._onDidChangeTreeData.fire();
  }

  private async fetchCategoryItems(node: CategoryNode): Promise<AnyTreeItem[]> {
    const env = node.env;
    const db = env === 'local' ? this.localDb : this.linkedDb;
    const cat = node.contextValue;

    switch (cat) {
      case 'migrations': {
        if (!this.migrationService) {
          return [];
        }
        const migrations = await this.migrationService.listMigrations();
        return migrations.map((m) => new MigrationNode(m));
      }

      case 'schemas': {
        if (!db) {
          return [];
        }
        const schemas = await db.getSchemas();
        return schemas.map((s) => new SchemaNode(s.schema_name, env));
      }

      case 'functions': {
        if (!db) {
          return [];
        }
        const fns = await db.getFunctions('public');
        return fns.map(
          (f) =>
            new FunctionNode(f.function_name, f.schema, f.return_type, env),
        );
      }

      case 'triggers': {
        if (!db) {
          return [];
        }
        const triggers = await db.getTriggers();
        return triggers.map(
          (t) => new TriggerNode(t.trigger_name, t.table_name, t.event, env),
        );
      }

      case 'enums': {
        if (!db) {
          return [];
        }
        const enums = await db.getEnums();
        return enums.map(
          (e) => new EnumNode(e.type_name, e.schema, e.values, env),
        );
      }

      case 'indexes': {
        if (!db) {
          return [];
        }
        const indexes = await db.getIndexes();
        return indexes.map(
          (i) => new IndexNode(i.index_name, i.table_name, i.schema, env),
        );
      }

      case 'roles': {
        if (!db) {
          return [];
        }
        const roles = await db.getRoles();
        return roles.map((r) => new RoleNode(r.role_name, env));
      }

      case 'policies': {
        if (!db) {
          return [];
        }
        const policies = await db.getPolicies();
        return policies.map(
          (p) => new PolicyNode(p.policy_name, p.table_name, p.schema, env),
        );
      }

      case 'storage': {
        if (!db) {
          return [];
        }
        const buckets = await db.getStorageBuckets();
        return buckets.map(
          (b) => new StorageBucketNode(b.id, b.name, b.public, env),
        );
      }

      default:
        return [];
    }
  }
}
