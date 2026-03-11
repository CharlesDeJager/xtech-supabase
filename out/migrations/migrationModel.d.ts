export type MigrationStatus = 'pending' | 'applied-local' | 'applied-linked' | 'applied-both';
export interface Migration {
    /** e.g. "20240101000000_create_users" */
    name: string;
    /** Absolute path to the .sql file */
    filePath: string;
    /** Timestamp prefix extracted from name */
    timestamp: string;
    status: MigrationStatus;
    appliedLocal: boolean;
    appliedLinked: boolean;
}
