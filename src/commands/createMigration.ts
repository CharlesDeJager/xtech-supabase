import * as vscode from 'vscode';
import { MigrationService } from '../migrations/migrationService';
import { SupabaseTreeProvider } from '../treeView/supabaseTreeProvider';
import { Logger } from '../logger';

export async function createMigrationCommand(
  migrationService: MigrationService,
  treeProvider: SupabaseTreeProvider,
  logger: Logger
): Promise<void> {
  const name = await vscode.window.showInputBox({
    prompt: 'Enter migration name (letters, numbers, underscores only)',
    placeHolder: 'e.g. create_users_table',
    validateInput: (value) => {
      if (!value || value.trim().length === 0) {
        return 'Migration name cannot be empty.';
      }
      if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
        return 'Migration name must contain only letters, numbers, and underscores.';
      }
      return undefined;
    },
  });

  if (!name) {
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Creating migration…',
      cancellable: false,
    },
    async () => {
      try {
        const filePath = await migrationService.createMigration(name.trim());
        treeProvider.refresh();

        const openFile = 'Open File';
        const choice = await vscode.window.showInformationMessage(
          `Migration created: ${filePath}`,
          openFile
        );

        if (choice === openFile) {
          const doc = await vscode.workspace.openTextDocument(filePath);
          await vscode.window.showTextDocument(doc);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('createMigration failed', err);
        vscode.window.showErrorMessage(`Failed to create migration: ${msg}`);
      }
    }
  );
}
