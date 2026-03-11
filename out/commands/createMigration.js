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
exports.createMigrationCommand = createMigrationCommand;
const vscode = __importStar(require("vscode"));
async function createMigrationCommand(migrationService, treeProvider, logger) {
    const name = await vscode.window.showInputBox({
        prompt: 'Enter migration name (letters, numbers, underscores only)',
        placeHolder: 'e.g. create_users_table',
        validateInput: (value) => {
            if (!value || value.trim().length === 0) {
                return 'Migration name cannot be empty.';
            }
            if (!/^[a-zA-Z0-9_]+$/.test(value.trim())) {
                return 'Migration name must contain only letters, numbers, and underscores.';
            }
            return undefined;
        },
    });
    if (!name) {
        return;
    }
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Creating migration…',
        cancellable: false,
    }, async () => {
        try {
            const filePath = await migrationService.createMigration(name.trim());
            treeProvider.refresh();
            const openFile = 'Open File';
            const choice = await vscode.window.showInformationMessage(`Migration created: ${filePath}`, openFile);
            if (choice === openFile) {
                const doc = await vscode.workspace.openTextDocument(filePath);
                await vscode.window.showTextDocument(doc);
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            logger.error('createMigration failed', err);
            vscode.window.showErrorMessage(`Failed to create migration: ${msg}`);
        }
    });
}
//# sourceMappingURL=createMigration.js.map