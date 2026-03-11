import { Logger } from '../logger';
export declare class LocalEnvironment {
    private projectRoot;
    private logger;
    constructor(projectRoot: string, logger: Logger);
    getDbUrl(): Promise<string | undefined>;
    getAppliedMigrations(): Promise<string[]>;
    private parseMigrationListOutput;
    private execCommand;
}
