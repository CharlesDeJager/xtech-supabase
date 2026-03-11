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
exports.MigrationService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const MIGRATION_NAME_RE = /^[a-zA-Z0-9_]+$/;
class MigrationService {
    constructor(projectRoot, localEnv, linkedEnv, logger) {
        this.projectRoot = projectRoot;
        this.localEnv = localEnv;
        this.linkedEnv = linkedEnv;
        this.logger = logger;
    }
    async listMigrations() {
        const migrationsDir = path.join(this.projectRoot, 'supabase', 'migrations');
        let sqlFiles = [];
        try {
            if (fs.existsSync(migrationsDir)) {
                sqlFiles = fs
                    .readdirSync(migrationsDir)
                    .filter((f) => f.endsWith('.sql'))
                    .sort();
            }
        }
        catch (err) {
            this.logger.error('Failed to read migrations directory', err);
        }
        let appliedLocal = [];
        let appliedLinked = [];
        try {
            appliedLocal = await this.localEnv.getAppliedMigrations();
        }
        catch (err) {
            this.logger.error('Failed to get local applied migrations', err);
        }
        try {
            if (this.linkedEnv) {
                appliedLinked = await this.linkedEnv.getAppliedMigrations();
            }
        }
        catch (err) {
            this.logger.error('Failed to get linked applied migrations', err);
        }
        const localSet = new Set(appliedLocal);
        const linkedSet = new Set(appliedLinked);
        return sqlFiles.map((file) => {
            const name = file.replace(/\.sql$/, '');
            const timestamp = name.substring(0, 14);
            const isLocal = localSet.has(name) || appliedLocal.some((m) => m.startsWith(timestamp));
            const isLinked = linkedSet.has(name) || appliedLinked.some((m) => m.startsWith(timestamp));
            return {
                name,
                filePath: path.join(migrationsDir, file),
                timestamp,
                status: MigrationService.computeStatus(isLocal, isLinked),
                appliedLocal: isLocal,
                appliedLinked: isLinked,
            };
        });
    }
    async createMigration(name) {
        if (!name || name.trim().length === 0) {
            throw new Error('Migration name cannot be empty.');
        }
        const trimmed = name.trim();
        if (!MIGRATION_NAME_RE.test(trimmed)) {
            throw new Error('Migration name must contain only letters, numbers, and underscores.');
        }
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
        const fileName = `${timestamp}_${trimmed}.sql`;
        const migrationsDir = path.join(this.projectRoot, 'supabase', 'migrations');
        if (!fs.existsSync(migrationsDir)) {
            fs.mkdirSync(migrationsDir, { recursive: true });
        }
        const filePath = path.join(migrationsDir, fileName);
        fs.writeFileSync(filePath, `-- Migration: ${trimmed}\n-- Created at: ${new Date().toISOString()}\n\n`);
        this.logger.info(`Created migration: ${filePath}`);
        return filePath;
    }
    static computeStatus(appliedLocal, appliedLinked) {
        if (appliedLocal && appliedLinked) {
            return 'applied-both';
        }
        if (appliedLocal) {
            return 'applied-local';
        }
        if (appliedLinked) {
            return 'applied-linked';
        }
        return 'pending';
    }
}
exports.MigrationService = MigrationService;
//# sourceMappingURL=migrationService.js.map