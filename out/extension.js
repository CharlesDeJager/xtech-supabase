"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const logger_1 = require("./logger");
const constants_1 = require("./constants");
const projectDiscovery_1 = require("./projectDiscovery");
const authProvider_1 = require("./auth/authProvider");
const localEnvironment_1 = require("./environment/localEnvironment");
const linkedEnvironment_1 = require("./environment/linkedEnvironment");
const migrationService_1 = require("./migrations/migrationService");
const databaseService_1 = require("./database/databaseService");
const supabaseTreeProvider_1 = require("./treeView/supabaseTreeProvider");
const createMigration_1 = require("./commands/createMigration");
const refreshAll_1 = require("./commands/refreshAll");
const settings_1 = require("./settings");
let refreshTimer;
async function activate(context) {
    const channel = vscode.window.createOutputChannel(constants_1.OUTPUT_CHANNEL_NAME);
    logger_1.Logger.resetInstance();
    const logger = logger_1.Logger.getInstance(channel);
    context.subscriptions.push(channel);
    logger.info('XTECH Supabase extension activating…');
    const discovery = new projectDiscovery_1.SupabaseProjectDiscovery();
    const projectRoot = await discovery.discover(vscode.workspace.workspaceFolders);
    if (!projectRoot) {
        logger.info('No Supabase project found in workspace (no supabase/config.toml). Tree view will be empty.');
        const treeProvider = new supabaseTreeProvider_1.SupabaseTreeProvider(logger);
        const treeView = vscode.window.createTreeView(constants_1.VIEW_ID, { treeDataProvider: treeProvider });
        context.subscriptions.push(treeView);
        registerBasicCommands(context, treeProvider, logger);
        return;
    }
    logger.info(`Supabase project root: ${projectRoot}`);
    const authProvider = new authProvider_1.AuthProvider(context, logger);
    const token = await authProvider.getToken();
    const linkedRef = await authProvider.getLinkedProjectRef();
    const localEnv = new localEnvironment_1.LocalEnvironment(projectRoot, logger);
    const linkedEnv = linkedRef ? new linkedEnvironment_1.LinkedEnvironment(linkedRef, token, logger) : undefined;
    const localDbUrl = await localEnv.getDbUrl();
    const localDb = localDbUrl
        ? new databaseService_1.DatabaseService(localDbUrl, undefined, logger, projectRoot)
        : undefined;
    const linkedDb = linkedRef && token
        ? new databaseService_1.DatabaseService(`https://${linkedRef}.supabase.co`, token, logger, undefined)
        : undefined;
    const migrationService = new migrationService_1.MigrationService(projectRoot, localEnv, linkedEnv, logger);
    const localConnected = !!localDbUrl;
    const linkedConnected = !!linkedRef;
    const treeProvider = new supabaseTreeProvider_1.SupabaseTreeProvider(logger, migrationService, localDb, linkedDb, localConnected, linkedConnected);
    const treeView = vscode.window.createTreeView(constants_1.VIEW_ID, {
        treeDataProvider: treeProvider,
        showCollapseAll: true,
    });
    context.subscriptions.push(treeView);
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand(constants_1.Commands.Refresh, () => (0, refreshAll_1.refreshAllCommand)(treeProvider, logger)), vscode.commands.registerCommand(constants_1.Commands.CreateMigration, () => (0, createMigration_1.createMigrationCommand)(migrationService, treeProvider, logger)), vscode.commands.registerCommand(constants_1.Commands.SetToken, async () => {
        const t = await vscode.window.showInputBox({
            prompt: 'Enter your Supabase access token',
            password: true,
            placeHolder: 'sbp_...',
        });
        if (t) {
            await authProvider.setToken(t);
            vscode.window.showInformationMessage('Supabase access token saved.');
        }
    }), vscode.commands.registerCommand(constants_1.Commands.ClearToken, async () => {
        await authProvider.clearToken();
        vscode.window.showInformationMessage('Supabase access token cleared.');
    }));
    // Auto-refresh
    const settings = (0, settings_1.getSettings)();
    if (settings.refreshInterval > 0) {
        refreshTimer = setInterval(() => {
            logger.debug(`Auto-refreshing (interval: ${settings.refreshInterval}s)`);
            treeProvider.refresh();
        }, settings.refreshInterval * 1000);
        context.subscriptions.push({
            dispose: () => {
                if (refreshTimer) {
                    clearInterval(refreshTimer);
                    refreshTimer = undefined;
                }
            },
        });
    }
    logger.info('XTECH Supabase extension activated.');
}
function registerBasicCommands(context, treeProvider, logger) {
    const authProvider = new authProvider_1.AuthProvider(context, logger);
    context.subscriptions.push(vscode.commands.registerCommand(constants_1.Commands.Refresh, () => (0, refreshAll_1.refreshAllCommand)(treeProvider, logger)), vscode.commands.registerCommand(constants_1.Commands.CreateMigration, () => {
        vscode.window.showWarningMessage('No Supabase project found. Please open a folder containing supabase/config.toml.');
    }), vscode.commands.registerCommand(constants_1.Commands.SetToken, async () => {
        const t = await vscode.window.showInputBox({
            prompt: 'Enter your Supabase access token',
            password: true,
            placeHolder: 'sbp_...',
        });
        if (t) {
            await authProvider.setToken(t);
            vscode.window.showInformationMessage('Supabase access token saved.');
        }
    }), vscode.commands.registerCommand(constants_1.Commands.ClearToken, async () => {
        await authProvider.clearToken();
        vscode.window.showInformationMessage('Supabase access token cleared.');
    }));
}
function deactivate() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
        refreshTimer = undefined;
    }
    logger_1.Logger.resetInstance();
}
//# sourceMappingURL=extension.js.map