import * as vscode from 'vscode';
import { Logger } from './logger';
import { OUTPUT_CHANNEL_NAME, VIEW_ID, Commands } from './constants';
import { SupabaseProjectDiscovery } from './projectDiscovery';
import { AuthProvider } from './auth/authProvider';
import { LocalEnvironment } from './environment/localEnvironment';
import { LinkedEnvironment } from './environment/linkedEnvironment';
import { MigrationService } from './migrations/migrationService';
import { DatabaseService } from './database/databaseService';
import { SupabaseTreeProvider } from './treeView/supabaseTreeProvider';
import { createMigrationCommand } from './commands/createMigration';
import { refreshAllCommand } from './commands/refreshAll';
import { getSettings } from './settings';

let refreshTimer: ReturnType<typeof setInterval> | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  Logger.resetInstance();
  const logger = Logger.getInstance(channel);
  context.subscriptions.push(channel);

  logger.info('XTECH Supabase extension activating…');

  const discovery = new SupabaseProjectDiscovery();
  const projectRoot = await discovery.discover(vscode.workspace.workspaceFolders);

  if (!projectRoot) {
    logger.info('No Supabase project found in workspace (no supabase/config.toml). Tree view will be empty.');
    const treeProvider = new SupabaseTreeProvider(logger);
    const treeView = vscode.window.createTreeView(VIEW_ID, { treeDataProvider: treeProvider });
    context.subscriptions.push(treeView);
    registerBasicCommands(context, treeProvider, logger);
    return;
  }

  logger.info(`Supabase project root: ${projectRoot}`);

  const authProvider = new AuthProvider(context, logger);
  const token = await authProvider.getToken();
  const linkedRef = await authProvider.getLinkedProjectRef();

  const localEnv = new LocalEnvironment(projectRoot, logger);
  const linkedEnv = linkedRef ? new LinkedEnvironment(linkedRef, token, logger) : undefined;

  const localDbUrl = await localEnv.getDbUrl();
  const localDb = localDbUrl
    ? new DatabaseService(localDbUrl, undefined, logger, projectRoot)
    : undefined;

  const linkedDb = linkedRef && token
    ? new DatabaseService(
        `https://${linkedRef}.supabase.co`,
        token,
        logger,
        undefined
      )
    : undefined;

  const migrationService = new MigrationService(projectRoot, localEnv, linkedEnv, logger);

  const localConnected = !!localDbUrl;
  const linkedConnected = !!linkedRef;

  const treeProvider = new SupabaseTreeProvider(
    logger,
    migrationService,
    localDb,
    linkedDb,
    localConnected,
    linkedConnected
  );

  const treeView = vscode.window.createTreeView(VIEW_ID, {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.Refresh, () =>
      refreshAllCommand(treeProvider, logger)
    ),
    vscode.commands.registerCommand(Commands.CreateMigration, () =>
      createMigrationCommand(migrationService, treeProvider, logger)
    ),
    vscode.commands.registerCommand(Commands.SetToken, async () => {
      const t = await vscode.window.showInputBox({
        prompt: 'Enter your Supabase access token',
        password: true,
        placeHolder: 'sbp_...',
      });
      if (t) {
        await authProvider.setToken(t);
        vscode.window.showInformationMessage('Supabase access token saved.');
      }
    }),
    vscode.commands.registerCommand(Commands.ClearToken, async () => {
      await authProvider.clearToken();
      vscode.window.showInformationMessage('Supabase access token cleared.');
    })
  );

  // Auto-refresh
  const settings = getSettings();
  if (settings.refreshInterval > 0) {
    refreshTimer = setInterval(() => {
      logger.debug(`Auto-refreshing (interval: ${settings.refreshInterval}s)`);
      treeProvider.refresh();
    }, settings.refreshInterval * 1000);

    context.subscriptions.push({
      dispose: () => {
        if (refreshTimer) {
          clearInterval(refreshTimer);
          refreshTimer = undefined;
        }
      },
    });
  }

  logger.info('XTECH Supabase extension activated.');
}

function registerBasicCommands(
  context: vscode.ExtensionContext,
  treeProvider: SupabaseTreeProvider,
  logger: Logger
): void {
  const authProvider = new AuthProvider(context, logger);

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.Refresh, () =>
      refreshAllCommand(treeProvider, logger)
    ),
    vscode.commands.registerCommand(Commands.CreateMigration, () => {
      vscode.window.showWarningMessage('No Supabase project found. Please open a folder containing supabase/config.toml.');
    }),
    vscode.commands.registerCommand(Commands.SetToken, async () => {
      const t = await vscode.window.showInputBox({
        prompt: 'Enter your Supabase access token',
        password: true,
        placeHolder: 'sbp_...',
      });
      if (t) {
        await authProvider.setToken(t);
        vscode.window.showInformationMessage('Supabase access token saved.');
      }
    }),
    vscode.commands.registerCommand(Commands.ClearToken, async () => {
      await authProvider.clearToken();
      vscode.window.showInformationMessage('Supabase access token cleared.');
    })
  );
}

export function deactivate(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = undefined;
  }
  Logger.resetInstance();
}
