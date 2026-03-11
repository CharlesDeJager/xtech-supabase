import { MigrationService } from '../migrations/migrationService';
import { SupabaseTreeProvider } from '../treeView/supabaseTreeProvider';
import { Logger } from '../logger';
export declare function createMigrationCommand(migrationService: MigrationService, treeProvider: SupabaseTreeProvider, logger: Logger): Promise<void>;
