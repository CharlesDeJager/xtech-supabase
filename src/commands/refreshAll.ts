import * as vscode from 'vscode';
import { SupabaseTreeProvider } from '../treeView/supabaseTreeProvider';
import { Logger } from '../logger';

export async function refreshAllCommand(
  treeProvider: SupabaseTreeProvider,
  logger: Logger
): Promise<void> {
  logger.info('Refreshing Supabase Explorer…');
  treeProvider.refresh();

  const statusBar = vscode.window.setStatusBarMessage('$(refresh) Supabase Explorer refreshed', 3000);
  // statusBar is a Disposable — it auto-disposes after 3s, no manual cleanup needed
  void statusBar;
}
