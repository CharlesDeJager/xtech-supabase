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
exports.SupabaseProjectDiscovery = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const settings_1 = require("./settings");
class SupabaseProjectDiscovery {
    async discover(workspaceFolders) {
        const settings = (0, settings_1.getSettings)();
        if (settings.projectPath) {
            const configPath = path.join(settings.projectPath, 'supabase', 'config.toml');
            if (fs.existsSync(configPath)) {
                return settings.projectPath;
            }
        }
        if (!workspaceFolders || workspaceFolders.length === 0) {
            return undefined;
        }
        for (const folder of workspaceFolders) {
            const found = await this.searchForConfig(folder.uri.fsPath);
            if (found) {
                return found;
            }
        }
        return undefined;
    }
    async searchForConfig(dirPath) {
        const configPath = path.join(dirPath, 'supabase', 'config.toml');
        if (fs.existsSync(configPath)) {
            return dirPath;
        }
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    const subPath = path.join(dirPath, entry.name);
                    const found = await this.searchForConfig(subPath);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        catch {
            // ignore permission errors
        }
        return undefined;
    }
    async getMigrationsPath(projectRoot) {
        return path.join(projectRoot, 'supabase', 'migrations');
    }
    async getConfigPath(projectRoot) {
        return path.join(projectRoot, 'supabase', 'config.toml');
    }
}
exports.SupabaseProjectDiscovery = SupabaseProjectDiscovery;
//# sourceMappingURL=projectDiscovery.js.map