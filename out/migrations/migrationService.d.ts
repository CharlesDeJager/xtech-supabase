import { Logger } from '../logger';
import { LocalEnvironment } from '../environment/localEnvironment';
import { LinkedEnvironment } from '../environment/linkedEnvironment';
import { Migration, MigrationStatus } from './migrationModel';
export declare class MigrationService {
    private projectRoot;
    private localEnv;
    private linkedEnv;
    private logger;
    constructor(projectRoot: string, localEnv: LocalEnvironment, linkedEnv: LinkedEnvironment | undefined, logger: Logger);
    listMigrations(): Promise<Migration[]>;
    createMigration(name: string): Promise<string>;
    static computeStatus(appliedLocal: boolean, appliedLinked: boolean): MigrationStatus;
}
