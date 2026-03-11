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
exports.LinkedEnvironment = void 0;
const child_process = __importStar(require("child_process"));
class LinkedEnvironment {
    constructor(projectRef, token, logger) {
        this.projectRef = projectRef;
        this.token = token;
        this.logger = logger;
    }
    get ref() {
        return this.projectRef;
    }
    async getAppliedMigrations() {
        try {
            const output = await this.execCommand('supabase', [
                'migration',
                'list',
                '--linked',
            ]);
            return this.parseMigrationListOutput(output);
        }
        catch (err) {
            this.logger.debug(`Could not get linked migrations via CLI: ${err}`);
            // Fallback to Management API if token is available
            if (this.token) {
                return this.getMigrationsViaApi();
            }
            return [];
        }
    }
    async getMigrationsViaApi() {
        if (!this.token) {
            return [];
        }
        try {
            const url = `https://api.supabase.com/v1/projects/${this.projectRef}/database/migrations`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                this.logger.warn(`Management API migrations request failed: ${response.status}`);
                return [];
            }
            const data = await response.json();
            return data.map((m) => m.version);
        }
        catch (err) {
            this.logger.error('Failed to fetch migrations from Management API', err);
            return [];
        }
    }
    async isLinked() {
        try {
            const output = await this.execCommand('supabase', ['status']);
            return output.includes('Linked project ref:') || output.includes(this.projectRef);
        }
        catch {
            return false;
        }
    }
    parseMigrationListOutput(output) {
        const migrations = [];
        const lines = output.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('─') || trimmed.startsWith('|') || trimmed.startsWith('Remote')) {
                continue;
            }
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
            child_process.execFile(cmd, args, { timeout: 30000 }, (err, stdout, stderr) => {
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
exports.LinkedEnvironment = LinkedEnvironment;
//# sourceMappingURL=linkedEnvironment.js.map