import * as vscode from 'vscode';
import * as crypto from 'crypto';
import { Commands } from '../constants';
import {
  DatabaseService,
  ColumnRow,
  FunctionDetailsRow,
  PolicyDetailsRow,
  TriggerDetailsRow,
  IndexDetailsRow,
  RoleDetailsRow,
  StorageBucketDetailsRow,
} from '../database/databaseService';
import {
  TableNode,
  ViewNode,
  FunctionNode,
  PolicyNode,
  TriggerNode,
  IndexNode,
  RoleNode,
  StorageBucketNode,
} from '../treeView/treeNodes';
import { Logger } from '../logger';
import {
  generateCreateTableSql,
  generateSelectSql,
  generateFunctionSql,
  generatePolicySql,
  generateTriggerSql,
  generateIndexSql,
  generateRoleSql,
  generateStorageBucketSql,
} from './sqlGenerators';

export {
  generateCreateTableSql,
  generateSelectSql,
  generateFunctionSql,
  generatePolicySql,
  generateTriggerSql,
  generateIndexSql,
  generateRoleSql,
  generateStorageBucketSql,
};

type ObjectNode = TableNode | ViewNode;

function escapeHtml(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildWebviewHtml(
  title: string,
  subtitle: string,
  headers: string[],
  rows: string[][],
  footerNote: string,
  sqlSnippet?: string,
): string {
  const headerCells = headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('');

  const bodyRows = rows
    .map((row) => {
      const cells = row
        .map((cell) =>
          cell === ''
            ? `<td class="null">null</td>`
            : `<td>${escapeHtml(cell)}</td>`,
        )
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('\n');

  const emptyState =
    rows.length === 0
      ? `<p class="empty">No rows found.</p>`
      : `<p class="row-count">${rows.length} row${rows.length !== 1 ? 's' : ''}${footerNote}</p>`;

  const nonce = generateNonce();
  const scriptCsp = sqlSnippet ? `script-src 'nonce-${nonce}';` : '';
  const copyButton = sqlSnippet
    ? `<button id="copy-sql-btn" class="copy-btn" data-sql="${escapeHtml(sqlSnippet)}">📋 Copy SQL</button>`
    : '';
  const copyScript = sqlSnippet
    ? `<script nonce="${nonce}">
  (function () {
    var btn = document.getElementById('copy-sql-btn');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.dataset.sql).then(function () {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = '📋 Copy SQL';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        btn.textContent = '✗ Failed to copy';
        setTimeout(function () { btn.textContent = '📋 Copy SQL'; }, 2000);
      });
    });
  })();
</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; ${scriptCsp}">
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 16px 20px;
      margin: 0;
    }
    h2 {
      margin: 0 0 4px 0;
      font-size: 1.1em;
    }
    .subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 0.88em;
      margin-bottom: 8px;
    }
    .actions {
      margin-bottom: 12px;
    }
    .copy-btn {
      font-family: var(--vscode-font-family);
      font-size: 0.85em;
      color: var(--vscode-button-foreground);
      background-color: var(--vscode-button-background);
      border: none;
      border-radius: 3px;
      padding: 4px 10px;
      cursor: pointer;
    }
    .copy-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    .copy-btn.copied {
      background-color: var(--vscode-testing-iconPassed, #4caf50);
    }
    .table-wrap {
      overflow-x: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
      white-space: nowrap;
    }
    th {
      background-color: var(--vscode-editor-lineHighlightBackground);
      color: var(--vscode-foreground);
      text-align: left;
      padding: 6px 12px;
      font-weight: 600;
      border-bottom: 2px solid var(--vscode-panel-border);
      position: sticky;
      top: 0;
    }
    td {
      padding: 5px 12px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    tr:hover td {
      background-color: var(--vscode-list-hoverBackground);
    }
    td.null {
      color: var(--vscode-descriptionForeground);
      font-style: italic;
    }
    .row-count, .empty {
      margin-top: 10px;
      color: var(--vscode-descriptionForeground);
      font-size: 0.85em;
    }
  </style>
</head>
<body>
  <h2>${escapeHtml(title)}</h2>
  <div class="subtitle">${escapeHtml(subtitle)}</div>
  ${copyButton ? `<div class="actions">${copyButton}</div>` : ''}
  <div class="table-wrap">
    ${
      rows.length > 0
        ? `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
        : ''
    }
  </div>
  ${emptyState}
  ${copyScript}
</body>
</html>`;
}

function getDb(
  node:
    | ObjectNode
    | FunctionNode
    | PolicyNode
    | TriggerNode
    | IndexNode
    | RoleNode
    | StorageBucketNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
): DatabaseService | undefined {
  return node.env === 'local' ? localDb : linkedDb;
}

function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '(null)';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

function generateNonce(): string {
  return crypto.randomBytes(16).toString('hex');
}

async function copySqlToClipboard(
  sql: string,
  label: string,
  logger: Logger,
): Promise<void> {
  try {
    await vscode.env.clipboard.writeText(sql);
    vscode.window.showInformationMessage(
      `SQL for ${label} copied to clipboard.`,
    );
  } catch (err) {
    logger.error(`Failed to copy SQL for ${label}`, err);
    vscode.window.showErrorMessage(
      `Failed to copy SQL to clipboard for ${label}.`,
    );
  }
}

function buildDetailHtml(
  title: string,
  subtitle: string,
  sections: Array<{ heading: string; body: string }>,
  sqlSnippet?: string,
): string {
  const content = sections
    .map(
      (section) => `
    <section>
      <h3>${escapeHtml(section.heading)}</h3>
      <pre>${escapeHtml(section.body)}</pre>
    </section>`,
    )
    .join('\n');

  const nonce = generateNonce();
  const scriptCsp = sqlSnippet ? `script-src 'nonce-${nonce}';` : '';
  const copyButton = sqlSnippet
    ? `<button id="copy-sql-btn" class="copy-btn" data-sql="${escapeHtml(sqlSnippet)}">📋 Copy SQL</button>`
    : '';
  const copyScript = sqlSnippet
    ? `<script nonce="${nonce}">
  (function () {
    var btn = document.getElementById('copy-sql-btn');
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(btn.dataset.sql).then(function () {
        btn.textContent = '✓ Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = '📋 Copy SQL';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        btn.textContent = '✗ Failed to copy';
        setTimeout(function () { btn.textContent = '📋 Copy SQL'; }, 2000);
      });
    });
  })();
</script>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; ${scriptCsp}">
  <style>
    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
      background-color: var(--vscode-editor-background);
      padding: 16px 20px;
      margin: 0;
      line-height: 1.45;
    }
    h2 {
      margin: 0 0 4px 0;
      font-size: 1.1em;
    }
    .subtitle {
      color: var(--vscode-descriptionForeground);
      font-size: 0.88em;
      margin-bottom: 8px;
    }
    .actions {
      margin-bottom: 16px;
    }
    .copy-btn {
      font-family: var(--vscode-font-family);
      font-size: 0.85em;
      color: var(--vscode-button-foreground);
      background-color: var(--vscode-button-background);
      border: none;
      border-radius: 3px;
      padding: 4px 10px;
      cursor: pointer;
    }
    .copy-btn:hover {
      background-color: var(--vscode-button-hoverBackground);
    }
    .copy-btn.copied {
      background-color: var(--vscode-testing-iconPassed, #4caf50);
    }
    section {
      margin-bottom: 12px;
    }
    h3 {
      margin: 0 0 6px 0;
      font-size: 0.95em;
      color: var(--vscode-textLink-foreground);
    }
    pre {
      margin: 0;
      white-space: pre-wrap;
      word-break: break-word;
      background: var(--vscode-editor-lineHighlightBackground);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      padding: 8px 10px;
    }
  </style>
</head>
<body>
  <h2>${escapeHtml(title)}</h2>
  <div class="subtitle">${escapeHtml(subtitle)}</div>
  ${copyButton ? `<div class="actions">${copyButton}</div>` : ''}
  ${content}
  ${copyScript}
</body>
</html>`;
}

function nodeLabel(node: ObjectNode): {
  schema: string;
  name: string;
  kind: string;
} {
  if (node instanceof TableNode) {
    return { schema: node.schema, name: node.tableName, kind: 'Table' };
  }
  return { schema: node.schema, name: node.viewName, kind: 'View' };
}

async function showSchema(
  node: ObjectNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  const { schema, name, kind } = nodeLabel(node);

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading schema for ${schema}.${name}…`,
      cancellable: false,
    },
    async () => {
      const columns: ColumnRow[] = await db.getObjectSchema(schema, name);

      const panel = vscode.window.createWebviewPanel(
        'supabaseObjectSchema',
        `Schema: ${schema}.${name}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      const headers = ['#', 'Column', 'Type', 'Nullable', 'Default'];
      const rows = columns.map((c) => [
        String(c.ordinal_position),
        c.column_name,
        c.data_type,
        c.is_nullable === 'YES' ? 'YES' : 'NO',
        c.column_default ?? '',
      ]);

      const sqlSnippet =
        columns.length > 0
          ? generateCreateTableSql(schema, name, columns)
          : undefined;

      panel.webview.html = buildWebviewHtml(
        `${kind} Schema — ${schema}.${name}`,
        `Environment: ${node.env}  •  ${columns.length} column${columns.length !== 1 ? 's' : ''}`,
        headers,
        rows,
        '',
        sqlSnippet,
      );

      if (columns.length === 0) {
        logger.warn(`No columns found for ${schema}.${name}`);
      }
    },
  );
}

async function showData(
  node: ObjectNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  const { schema, name, kind } = nodeLabel(node);
  const limit = 200;

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading data from ${schema}.${name}…`,
      cancellable: false,
    },
    async () => {
      const dataRows = await db.getObjectData(schema, name, limit);

      const panel = vscode.window.createWebviewPanel(
        'supabaseObjectData',
        `Data: ${schema}.${name}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      const selectSql = generateSelectSql(schema, name);

      if (dataRows.length === 0) {
        const headers: string[] = [];
        panel.webview.html = buildWebviewHtml(
          `${kind} Data — ${schema}.${name}`,
          `Environment: ${node.env}`,
          headers,
          [],
          '',
          selectSql,
        );
        return;
      }

      const headers = Object.keys(dataRows[0]);
      const rows = dataRows.map((row) =>
        headers.map((h) => {
          const v = row[h];
          if (v === null || v === undefined) {
            return '';
          }
          if (typeof v === 'object') {
            return JSON.stringify(v);
          }
          return String(v);
        }),
      );

      const footerNote =
        dataRows.length === limit ? ` (first ${limit} rows)` : '';

      panel.webview.html = buildWebviewHtml(
        `${kind} Data — ${schema}.${name}`,
        `Environment: ${node.env}`,
        headers,
        rows,
        footerNote,
        selectSql,
      );

      logger.debug(`Loaded ${dataRows.length} rows from ${schema}.${name}`);
    },
  );
}

function normalizeRoles(roles: string[] | string): string {
  if (Array.isArray(roles)) {
    return roles.join(', ');
  }
  return roles;
}

async function showFunctionDetails(
  node: FunctionNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading function details for ${node.schema}.${node.functionName}…`,
      cancellable: false,
    },
    async () => {
      const details: FunctionDetailsRow[] = await db.getFunctionDetails(
        node.schema,
        node.functionName,
      );

      const panel = vscode.window.createWebviewPanel(
        'supabaseFunctionDetails',
        `Function: ${node.schema}.${node.functionName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Function Details — ${node.schema}.${node.functionName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No function details found.',
            },
          ],
        );
        return;
      }

      const sections = details.map((d, i) => ({
        heading: `Overload ${i + 1}`,
        body: [
          `Signature: ${d.schema}.${d.function_name}(${d.argument_signature})`,
          `Return Type: ${d.return_type}`,
          `Language: ${d.language}`,
          `Volatility: ${d.volatility}`,
          `Security: ${d.security_definer ? 'DEFINER' : 'INVOKER'}`,
          '',
          d.definition,
        ].join('\n'),
      }));

      panel.webview.html = buildDetailHtml(
        `Function Details — ${node.schema}.${node.functionName}`,
        `Environment: ${node.env}  •  ${details.length} overload${details.length !== 1 ? 's' : ''}`,
        sections,
        generateFunctionSql(details),
      );

      logger.debug(
        `Loaded ${details.length} function detail row(s) for ${node.schema}.${node.functionName}`,
      );
    },
  );
}

async function showPolicyDetails(
  node: PolicyNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading policy details for ${node.schema}.${node.policyName}…`,
      cancellable: false,
    },
    async () => {
      const details: PolicyDetailsRow[] = await db.getPolicyDetails(
        node.schema,
        node.tableName,
        node.policyName,
      );

      const panel = vscode.window.createWebviewPanel(
        'supabasePolicyDetails',
        `Policy: ${node.schema}.${node.policyName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Policy Details — ${node.schema}.${node.policyName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No policy details found.',
            },
          ],
        );
        return;
      }

      const detail = details[0];
      panel.webview.html = buildDetailHtml(
        `Policy Details — ${detail.schema}.${detail.policy_name}`,
        `Environment: ${node.env}  •  Table: ${detail.schema}.${detail.table_name}`,
        [
          {
            heading: 'Metadata',
            body: [
              `Command: ${detail.cmd}`,
              `Permissive: ${detail.permissive}`,
              `Roles: ${normalizeRoles(detail.roles)}`,
            ].join('\n'),
          },
          {
            heading: 'USING Expression',
            body: detail.using_expression ?? '(none)',
          },
          {
            heading: 'WITH CHECK Expression',
            body: detail.with_check ?? '(none)',
          },
        ],
        generatePolicySql(detail),
      );

      logger.debug(
        `Loaded policy details for ${node.schema}.${node.tableName}.${node.policyName}`,
      );
    },
  );
}

async function showTriggerDetails(
  node: TriggerNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading trigger details for ${node.schema}.${node.triggerName}…`,
      cancellable: false,
    },
    async () => {
      const details: TriggerDetailsRow[] = await db.getTriggerDetails(
        node.schema,
        node.tableName,
        node.triggerName,
      );

      const panel = vscode.window.createWebviewPanel(
        'supabaseTriggerDetails',
        `Trigger: ${node.schema}.${node.triggerName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Trigger Details — ${node.schema}.${node.triggerName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No trigger details found.',
            },
          ],
        );
        return;
      }

      const sections = details.map((detail, i) => ({
        heading: `Event ${i + 1}`,
        body: [
          `Schema: ${detail.schema}`,
          `Table: ${detail.table_name}`,
          `Timing: ${detail.timing}`,
          `Event: ${detail.event}`,
          `Orientation: ${detail.orientation}`,
          '',
          'Action Statement:',
          detail.action_statement,
        ].join('\n'),
      }));

      panel.webview.html = buildDetailHtml(
        `Trigger Details — ${node.schema}.${node.triggerName}`,
        `Environment: ${node.env}`,
        sections,
        generateTriggerSql(details),
      );

      logger.debug(
        `Loaded ${details.length} trigger detail row(s) for ${node.schema}.${node.tableName}.${node.triggerName}`,
      );
    },
  );
}

async function showIndexDetails(
  node: IndexNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading index details for ${node.schema}.${node.indexName}…`,
      cancellable: false,
    },
    async () => {
      const details: IndexDetailsRow[] = await db.getIndexDetails(
        node.schema,
        node.tableName,
        node.indexName,
      );

      const panel = vscode.window.createWebviewPanel(
        'supabaseIndexDetails',
        `Index: ${node.schema}.${node.indexName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Index Details — ${node.schema}.${node.indexName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No index details found.',
            },
          ],
        );
        return;
      }

      const detail = details[0];
      panel.webview.html = buildDetailHtml(
        `Index Details — ${detail.schema}.${detail.index_name}`,
        `Environment: ${node.env}  •  Table: ${detail.schema}.${detail.table_name}`,
        [
          {
            heading: 'Definition',
            body: detail.indexdef,
          },
        ],
        generateIndexSql(detail),
      );

      logger.debug(
        `Loaded index details for ${node.schema}.${node.tableName}.${node.indexName}`,
      );
    },
  );
}

async function showRoleDetails(
  node: RoleNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading role details for ${node.roleName}…`,
      cancellable: false,
    },
    async () => {
      const details: RoleDetailsRow[] = await db.getRoleDetails(node.roleName);

      const panel = vscode.window.createWebviewPanel(
        'supabaseRoleDetails',
        `Role: ${node.roleName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Role Details — ${node.roleName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No role details found.',
            },
          ],
        );
        return;
      }

      const detail = details[0];
      panel.webview.html = buildDetailHtml(
        `Role Details — ${detail.role_name}`,
        `Environment: ${node.env}`,
        [
          {
            heading: 'Attributes',
            body: [
              `Superuser: ${detail.rolsuper}`,
              `Inherit: ${detail.rolinherit}`,
              `Create Role: ${detail.rolcreaterole}`,
              `Create DB: ${detail.rolcreatedb}`,
              `Can Login: ${detail.rolcanlogin}`,
              `Replication: ${detail.rolreplication}`,
              `Bypass RLS: ${detail.rolbypassrls}`,
              `Connection Limit: ${detail.rolconnlimit}`,
              `Valid Until: ${detail.valid_until ?? '(never)'}`,
            ].join('\n'),
          },
        ],
        generateRoleSql(detail),
      );

      logger.debug(`Loaded role details for ${node.roleName}`);
    },
  );
}

async function showStorageBucketDetails(
  node: StorageBucketNode,
  localDb: DatabaseService | undefined,
  linkedDb: DatabaseService | undefined,
  context: vscode.ExtensionContext,
  logger: Logger,
): Promise<void> {
  const db = getDb(node, localDb, linkedDb);
  if (!db) {
    vscode.window.showWarningMessage(
      'Database connection is not available for this environment.',
    );
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Loading storage bucket details for ${node.bucketName}…`,
      cancellable: false,
    },
    async () => {
      const details: StorageBucketDetailsRow[] =
        await db.getStorageBucketDetails(node.bucketId);

      const panel = vscode.window.createWebviewPanel(
        'supabaseStorageBucketDetails',
        `Bucket: ${node.bucketName}`,
        vscode.ViewColumn.One,
        { enableScripts: true },
      );
      context.subscriptions.push(panel);

      if (details.length === 0) {
        panel.webview.html = buildDetailHtml(
          `Storage Bucket Details — ${node.bucketName}`,
          `Environment: ${node.env}`,
          [
            {
              heading: 'Result',
              body: 'No storage bucket details found.',
            },
          ],
          generateStorageBucketSql(node.bucketId, node.bucketName, node.isPublic),
        );
        return;
      }

      const payload = details[0].details_json ?? {};
      const body = Object.entries(payload)
        .map(([key, value]) => `${key}: ${stringifyValue(value)}`)
        .join('\n');

      panel.webview.html = buildDetailHtml(
        `Storage Bucket Details — ${node.bucketName}`,
        `Environment: ${node.env}  •  Bucket ID: ${node.bucketId}`,
        [
          {
            heading: 'Metadata',
            body,
          },
        ],
        generateStorageBucketSql(node.bucketId, node.bucketName, node.isPublic),
      );

      logger.debug(`Loaded storage bucket details for ${node.bucketId}`);
    },
  );
}

export function registerViewObjectCommands(
  context: vscode.ExtensionContext,
  getLocalDb: () => DatabaseService | undefined,
  getLinkedDb: () => DatabaseService | undefined,
  logger: Logger,
): void {
  const missingSelectionMessage =
    'Select an object in Supabase Explorer before running this command.';

  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.ViewTableSchema,
      (node?: TableNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showSchema(node, getLocalDb(), getLinkedDb(), context, logger);
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewTableData,
      (node?: TableNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showData(node, getLocalDb(), getLinkedDb(), context, logger);
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewViewSchema,
      (node?: ViewNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showSchema(node, getLocalDb(), getLinkedDb(), context, logger);
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewViewData,
      (node?: ViewNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showData(node, getLocalDb(), getLinkedDb(), context, logger);
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewFunctionDetails,
      (node?: FunctionNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showFunctionDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewPolicyDetails,
      (node?: PolicyNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showPolicyDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewTriggerDetails,
      (node?: TriggerNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showTriggerDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewIndexDetails,
      (node?: IndexNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showIndexDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewRoleDetails,
      (node?: RoleNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showRoleDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.ViewStorageBucketDetails,
      (node?: StorageBucketNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        void showStorageBucketDetails(
          node,
          getLocalDb(),
          getLinkedDb(),
          context,
          logger,
        );
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlTable,
      (node?: TableNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const columns = await db.getObjectSchema(node.schema, node.tableName);
          const sql = generateCreateTableSql(node.schema, node.tableName, columns);
          await copySqlToClipboard(sql, `${node.schema}.${node.tableName}`, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlView,
      (node?: ViewNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const sql = generateSelectSql(node.schema, node.viewName);
        void copySqlToClipboard(sql, `${node.schema}.${node.viewName}`, logger);
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlFunction,
      (node?: FunctionNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const details = await db.getFunctionDetails(node.schema, node.functionName);
          if (details.length === 0) {
            vscode.window.showWarningMessage(
              `No details found for function ${node.schema}.${node.functionName}.`,
            );
            return;
          }
          const sql = generateFunctionSql(details);
          await copySqlToClipboard(sql, `${node.schema}.${node.functionName}`, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlPolicy,
      (node?: PolicyNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const details = await db.getPolicyDetails(node.schema, node.tableName, node.policyName);
          if (details.length === 0) {
            vscode.window.showWarningMessage(
              `No details found for policy ${node.policyName}.`,
            );
            return;
          }
          const sql = generatePolicySql(details[0]);
          await copySqlToClipboard(sql, node.policyName, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlTrigger,
      (node?: TriggerNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const details = await db.getTriggerDetails(node.schema, node.tableName, node.triggerName);
          if (details.length === 0) {
            vscode.window.showWarningMessage(
              `No details found for trigger ${node.triggerName}.`,
            );
            return;
          }
          const sql = generateTriggerSql(details);
          await copySqlToClipboard(sql, node.triggerName, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlIndex,
      (node?: IndexNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const details = await db.getIndexDetails(node.schema, node.tableName, node.indexName);
          if (details.length === 0) {
            vscode.window.showWarningMessage(
              `No details found for index ${node.indexName}.`,
            );
            return;
          }
          const sql = generateIndexSql(details[0]);
          await copySqlToClipboard(sql, node.indexName, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlRole,
      (node?: RoleNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const db = getDb(node, getLocalDb(), getLinkedDb());
        if (!db) {
          vscode.window.showWarningMessage(
            'Database connection is not available for this environment.',
          );
          return;
        }
        void (async () => {
          const details = await db.getRoleDetails(node.roleName);
          if (details.length === 0) {
            vscode.window.showWarningMessage(
              `No details found for role ${node.roleName}.`,
            );
            return;
          }
          const sql = generateRoleSql(details[0]);
          await copySqlToClipboard(sql, node.roleName, logger);
        })();
      },
    ),
    vscode.commands.registerCommand(
      Commands.CopySqlStorageBucket,
      (node?: StorageBucketNode) => {
        if (!node) {
          vscode.window.showWarningMessage(missingSelectionMessage);
          return;
        }
        const sql = generateStorageBucketSql(node.bucketId, node.bucketName, node.isPublic);
        void copySqlToClipboard(sql, node.bucketName, logger);
      },
    ),
  );
}
