import { Logger } from '../logger';
export interface SchemaRow {
    schema_name: string;
}
export interface TableRow {
    table_name: string;
    schema: string;
}
export interface ViewRow {
    view_name: string;
    schema: string;
}
export interface FunctionRow {
    function_name: string;
    schema: string;
    return_type: string;
}
export interface TriggerRow {
    trigger_name: string;
    table_name: string;
    event: string;
}
export interface EnumRow {
    type_name: string;
    schema: string;
    values: string[];
}
export interface IndexRow {
    index_name: string;
    table_name: string;
    schema: string;
}
export interface RoleRow {
    role_name: string;
}
export interface PolicyRow {
    policy_name: string;
    table_name: string;
    schema: string;
}
export interface StorageBucketRow {
    id: string;
    name: string;
    public: boolean;
}
export declare class DatabaseService {
    private dbUrl;
    private token;
    private logger;
    private supabase;
    private projectRoot;
    constructor(dbUrl: string, token: string | undefined, logger: Logger, projectRoot?: string);
    private isLinkedUrl;
    private extractProjectUrl;
    query<T>(sql: string): Promise<T[]>;
    private queryViaCli;
    private queryViaManagementApi;
    getSchemas(): Promise<SchemaRow[]>;
    getTables(schema: string): Promise<TableRow[]>;
    getViews(schema: string): Promise<ViewRow[]>;
    getFunctions(schema: string): Promise<FunctionRow[]>;
    getTriggers(): Promise<TriggerRow[]>;
    getEnums(): Promise<EnumRow[]>;
    getIndexes(): Promise<IndexRow[]>;
    getRoles(): Promise<RoleRow[]>;
    getPolicies(): Promise<PolicyRow[]>;
    getStorageBuckets(): Promise<StorageBucketRow[]>;
}
