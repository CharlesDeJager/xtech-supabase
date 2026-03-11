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
exports.AuthProvider = void 0;
const child_process = __importStar(require("child_process"));
const settings_1 = require("../settings");
const constants_1 = require("../constants");
class AuthProvider {
    constructor(context, logger) {
        this.context = context;
        this.logger = logger;
    }
    async getToken() {
        const settings = (0, settings_1.getSettings)();
        if (settings.authMode === 'token') {
            const token = await this.context.secrets.get(constants_1.SECRET_TOKEN_KEY);
            if (!token) {
                this.logger.warn('Auth mode is "token" but no token found in SecretStorage.');
            }
            return token;
        }
        // cli mode: try to extract token from supabase status
        return this.getCliToken();
    }
    async getCliToken() {
        try {
            const output = await this.execCommand('supabase', ['projects', 'list', '--json']);
            // If the command succeeds, the CLI is authenticated; return a sentinel or undefined
            // The CLI manages its own auth; token-based queries aren't used in cli mode
            this.logger.debug(`supabase projects list succeeded: ${output.substring(0, 100)}`);
            return undefined;
        }
        catch (err) {
            this.logger.debug(`CLI auth not available: ${err}`);
            return undefined;
        }
    }
    async setToken(token) {
        await this.context.secrets.store(constants_1.SECRET_TOKEN_KEY, token);
        this.logger.info('Supabase access token stored in SecretStorage.');
    }
    async clearToken() {
        await this.context.secrets.delete(constants_1.SECRET_TOKEN_KEY);
        this.logger.info('Supabase access token cleared from SecretStorage.');
    }
    async isCliAvailable() {
        try {
            await this.execCommand('supabase', ['--version']);
            return true;
        }
        catch {
            return false;
        }
    }
    async getLinkedProjectRef() {
        const settings = (0, settings_1.getSettings)();
        if (settings.linkedProjectRef) {
            return settings.linkedProjectRef;
        }
        try {
            const output = await this.execCommand('supabase', ['status', '--output', 'json']);
            const data = JSON.parse(output);
            if (data && typeof data['project_ref'] === 'string') {
                return data['project_ref'];
            }
            return undefined;
        }
        catch (err) {
            this.logger.debug(`Could not get linked project ref from CLI: ${err}`);
            return undefined;
        }
    }
    execCommand(cmd, args) {
        return new Promise((resolve, reject) => {
            child_process.execFile(cmd, args, { timeout: 15000 }, (err, stdout, stderr) => {
                if (err) {
                    reject(new Error(`Command failed: ${cmd} ${args.join(' ')} — ${stderr || err.message}`));
                }
                else {
                    resolve(stdout);
                }
            });
        });
    }
}
exports.AuthProvider = AuthProvider;
//# sourceMappingURL=authProvider.js.map