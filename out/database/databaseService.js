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
exports.DatabaseService = void 0;
const child_process = __importStar(require("child_process"));
const supabase_js_1 = require("@supabase/supabase-js");
const introspectionQueries_1 = require("./introspectionQueries");
class DatabaseService {
    constructor(dbUrl, token, logger, projectRoot) {
        this.dbUrl = dbUrl;
        this.token = token;
        this.logger = logger;
        this.projectRoot = projectRoot;
        if (this.isLinkedUrl(dbUrl) && token) {
            // For linked environments using Supabase JS client
            const projectUrl = this.extractProjectUrl(dbUrl);
            if (projectUrl) {
                this.supabase = (0, supabase_js_1.createClient)(projectUrl, token);
            }
        }
    }
    isLinkedUrl(url) {
        return url.includes('supabase.co') || url.includes('supabase.io');
    }
    extractProjectUrl(dbUrl) {
        // Transform postgres connection URL to Supabase REST URL if needed
        const match = dbUrl.match(/([a-z0-9]+)\.supabase\.co/);
        if (match) {
            return `https://${match[1]}.supabase.co`;
        }
        return undefined;
    }
    async query(sql) {
        if (this.projectRoot && !this.isLinkedUrl(this.dbUrl)) {
            return this.queryViaCli(sql);
        }
        if (this.token) {
            return this.queryViaManagementApi(sql);
        }
        this.logger.warn('No query method available (no CLI project root or token).');
        return [];
    }
    async queryViaCli(sql) {
        return new Promise((resolve, reject) => {
            child_process.execFile('supabase', ['db', 'query', sql, '--local'], { cwd: this.projectRoot, timeout: 30000 }, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`supabase db query failed: ${stderr || err.message}`));
                }
                else {
                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    }
                    catch {
                        // Try to parse as CSV or table output
                        resolve([]);
                    }
                }
            });
        });
    }
    async queryViaManagementApi(sql) {
        if (!this.token) {
            return [];
        }
        const refMatch = this.dbUrl.match(/([a-z0-9]+)\.supabase\.co/);
        if (!refMatch) {
            this.logger.warn('Cannot determine project ref from DB URL for Management API.');
            return [];
        }
        const ref = refMatch[1];
        try {
            const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: sql }),
            });
            if (!response.ok) {
                const body = await response.text();
                this.logger.warn(`Management API query failed: ${response.status} — ${body}`);
                return [];
            }
            const data = await response.json();
            return data;
        }
        catch (err) {
            this.logger.error('Management API query error', err);
            return [];
        }
    }
    async getSchemas() {
        try {
            return await this.query(introspectionQueries_1.QUERY_SCHEMAS);
        }
        catch (err) {
            this.logger.error('getSchemas failed', err);
            return [];
        }
    }
    async getTables(schema) {
        try {
            const sql = introspectionQueries_1.QUERY_TABLES.replace('$1', `'${schema}'`);
            return await this.query(sql);
        }
        catch (err) {
            this.logger.error(`getTables(${schema}) failed`, err);
            return [];
        }
    }
    async getViews(schema) {
        try {
            const sql = introspectionQueries_1.QUERY_VIEWS.replace('$1', `'${schema}'`);
            return await this.query(sql);
        }
        catch (err) {
            this.logger.error(`getViews(${schema}) failed`, err);
            return [];
        }
    }
    async getFunctions(schema) {
        try {
            const sql = introspectionQueries_1.QUERY_FUNCTIONS.replace('$1', `'${schema}'`);
            return await this.query(sql);
        }
        catch (err) {
            this.logger.error(`getFunctions(${schema}) failed`, err);
            return [];
        }
    }
    async getTriggers() {
        try {
            return await this.query(introspectionQueries_1.QUERY_TRIGGERS);
        }
        catch (err) {
            this.logger.error('getTriggers failed', err);
            return [];
        }
    }
    async getEnums() {
        try {
            return await this.query(introspectionQueries_1.QUERY_ENUMS);
        }
        catch (err) {
            this.logger.error('getEnums failed', err);
            return [];
        }
    }
    async getIndexes() {
        try {
            return await this.query(introspectionQueries_1.QUERY_INDEXES);
        }
        catch (err) {
            this.logger.error('getIndexes failed', err);
            return [];
        }
    }
    async getRoles() {
        try {
            return await this.query(introspectionQueries_1.QUERY_ROLES);
        }
        catch (err) {
            this.logger.error('getRoles failed', err);
            return [];
        }
    }
    async getPolicies() {
        try {
            return await this.query(introspectionQueries_1.QUERY_POLICIES);
        }
        catch (err) {
            this.logger.error('getPolicies failed', err);
            return [];
        }
    }
    async getStorageBuckets() {
        try {
            return await this.query(introspectionQueries_1.QUERY_STORAGE_BUCKETS);
        }
        catch (err) {
            this.logger.error('getStorageBuckets failed', err);
            return [];
        }
    }
}
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=databaseService.js.map