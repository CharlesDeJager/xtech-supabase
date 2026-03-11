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
exports.LocalEnvironment = void 0;
const child_process = __importStar(require("child_process"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const settings_1 = require("../settings");
class LocalEnvironment {
    constructor(projectRoot, logger) {
        this.projectRoot = projectRoot;
        this.logger = logger;
    }
    async getDbUrl() {
        const settings = (0, settings_1.getSettings)();
        if (settings.localDbUrl) {
            return settings.localDbUrl;
        }
        try {
            const configPath = path.join(this.projectRoot, 'supabase', 'config.toml');
            const content = fs.readFileSync(configPath, 'utf-8');
            const portMatch = content.match(/^\s*port\s*=\s*(\d+)/m);
            if (portMatch) {
                const port = portMatch[1];
                return `postgresql://postgres:postgres@localhost:${port}/postgres`;
            }
            // Default Supabase local port
            return 'postgresql://postgres:postgres@localhost:54322/postgres';
        }
        catch (err) {
            this.logger.warn(`Could not read config.toml to determine DB port: ${err}`);
            return 'postgresql://postgres:postgres@localhost:54322/postgres';
        }
    }
    async getAppliedMigrations() {
        try {
            const output = await this.execCommand('supabase', [
                'migration',
                'list',
                '--local',
            ]);
            return this.parseMigrationListOutput(output);
        }
        catch (err) {
            this.logger.debug(`Could not get local migrations via CLI: ${err}`);
            return [];
        }
    }
    parseMigrationListOutput(output) {
        const migrations = [];
        const lines = output.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            // Skip header/separator lines
            if (!trimmed || trimmed.startsWith('─') || trimmed.startsWith('|') || trimmed.startsWith('Local')) {
                continue;
            }
            // Extract migration name from table rows like "  20240101000000  │  create_users  │ ..."
            const parts = trimmed.split(/\s{2,}|\t|│/);
            const name = parts[0]?.trim();
            if (name && /^\d{14}/.test(name)) {
                migrations.push(name);
            }
        }
        return migrations;
    }
    execCommand(cmd, args) {
        return new Promise((resolve, reject) => {
            child_process.execFile(cmd, args, { cwd: this.projectRoot, timeout: 30000 }, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`${cmd} ${args.join(' ')} failed: ${stderr || err.message}`));
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
}
exports.LocalEnvironment = LocalEnvironment;
//# sourceMappingURL=localEnvironment.js.map