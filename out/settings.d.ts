export interface ExtensionSettings {
    projectPath: string | undefined;
    authMode: 'cli' | 'token';
    refreshInterval: number;
    localDbUrl: string | undefined;
    linkedProjectRef: string | undefined;
}
export declare function getSettings(): ExtensionSettings;
