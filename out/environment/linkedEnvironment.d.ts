import { Logger } from '../logger';
export declare class LinkedEnvironment {
    private projectRef;
    private token;
    private logger;
    constructor(projectRef: string, token: string | undefined, logger: Logger);
    get ref(): string;
    getAppliedMigrations(): Promise<string[]>;
    private getMigrationsViaApi;
    isLinked(): Promise<boolean>;
    private parseMigrationListOutput;
    private execCommand;
}
