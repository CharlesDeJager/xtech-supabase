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
import { getSettings } from './settings';

let refreshTimer: ReturnType<typeof setInterval> | undefined;

export async function activate(
  context: vscode.ExtensionContext,
): Promise<void> {
  const channel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
  Logger.resetInstance();
  const logger = Logger.getInstance(channel);
  context.subscriptions.push(channel);

  logger.info('XTECH Supabase extension activating…');

  // Register view and commands immediately so command execution works even while
  // project discovery/auth initialization is still in progress.
  const treeProvider = new SupabaseTreeProvider(logger);
  const treeView = vscode.window.createTreeView(VIEW_ID, {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });
  context.subscriptions.push(treeView);

  const authProvider = new AuthProvider(context, logger);
  let migrationService: MigrationService | undefined;

  // Re-reads settings, re-runs discovery, and rebuilds all services.
  // Called on first activation, on Refresh, and when relevant settings change.
  async function reinitialize(): Promise<void> {
    logger.info('Initializing Supabase services…');

    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = undefined;
    }

    const discovery = new SupabaseProjectDiscovery();
    const projectRoot = await discovery.discover(
      vscode.workspace.workspaceFolders,
    );

    if (!projectRoot) {
      logger.info(
        'No Supabase project found (no supabase/config.toml). Tree view will be empty.',
      );
      migrationService = undefined;
      treeProvider.setServices(undefined, undefined, undefined, false, false);
      treeProvider.refresh();
      return;
    }

    logger.info(`Supabase project root: ${projectRoot}`);

    const token = await authProvider.getToken();
    const linkedRef = await authProvider.getLinkedProjectRef(projectRoot);

    const localEnv = new LocalEnvironment(projectRoot, logger);
    const localRunning = await localEnv.isRunning();
    const linkedEnv = linkedRef
      ? new LinkedEnvironment(linkedRef, token, logger)
      : undefined;

    const localDbUrl = await localEnv.getDbUrl();
    const localDb =
      localRunning && localDbUrl
        ? new DatabaseService(localDbUrl, undefined, logger, projectRoot)
        : undefined;

    const linkedDb =
      linkedRef && token
        ? new DatabaseService(
            `https://${linkedRef}.supabase.co`,
            token,
            logger,
            undefined,
          )
        : undefined;

    migrationService = new MigrationService(
      projectRoot,
      localEnv,
      linkedEnv,
      logger,
    );

    treeProvider.setServices(
      migrationService,
      localDb,
      linkedDb,
      localRunning && !!localDbUrl,
      !!linkedRef,
    );
    treeProvider.refresh();

    const settings = getSettings();
    if (settings.refreshInterval > 0) {
      refreshTimer = setInterval(() => {
        logger.debug(
          `Auto-refreshing (interval: ${settings.refreshInterval}s)`,
        );
        treeProvider.refresh();
      }, settings.refreshInterval * 1000);
    }
  }

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.Refresh, async () => {
      logger.info('Refreshing Supabase Explorer…');
      await reinitialize();
      vscode.window.setStatusBarMessage(
        '$(refresh) Supabase Explorer refreshed',
        3000,
      );
    }),
    vscode.commands.registerCommand(Commands.CreateMigration, async () => {
      if (!migrationService) {
        vscode.window.showWarningMessage(
          'No Supabase project found. Please open a folder containing supabase/config.toml.',
        );
        return;
      }
      await createMigrationCommand(migrationService, treeProvider, logger);
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
    }),
  );

  // Reinitialize automatically when any extension setting changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('xtech-supabase')) {
        logger.info('Settings changed, reinitializing…');
        reinitialize();
      }
    }),
  );

  await reinitialize();

  logger.info('XTECH Supabase extension activated.');
}

export function deactivate(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = undefined;
  }
  Logger.resetInstance();
}
