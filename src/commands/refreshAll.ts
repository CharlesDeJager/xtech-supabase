import * as vscode from 'vscode';
import { SupabaseTreeProvider } from '../treeView/supabaseTreeProvider';
import { Logger } from '../logger';

export async function refreshAllCommand(
  treeProvider: SupabaseTreeProvider,
  logger: Logger
): Promise<void> {
  logger.info('Refreshing Supabase Explorer…');
  treeProvider.refresh();

  vscode.window.setStatusBarMessage('$(refresh) Supabase Explorer refreshed', 3000);
}
