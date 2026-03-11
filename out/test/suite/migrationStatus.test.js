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
const assert = __importStar(require("assert"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const migrationService_1 = require("../../migrations/migrationService");
suite('MigrationService.computeStatus', () => {
    test('pending: false, false', () => {
        const status = migrationService_1.MigrationService.computeStatus(false, false);
        assert.strictEqual(status, 'pending');
    });
    test('applied-local: true, false', () => {
        const status = migrationService_1.MigrationService.computeStatus(true, false);
        assert.strictEqual(status, 'applied-local');
    });
    test('applied-linked: false, true', () => {
        const status = migrationService_1.MigrationService.computeStatus(false, true);
        assert.strictEqual(status, 'applied-linked');
    });
    test('applied-both: true, true', () => {
        const status = migrationService_1.MigrationService.computeStatus(true, true);
        assert.strictEqual(status, 'applied-both');
    });
});
suite('MigrationService.createMigration name validation', () => {
    let tmpDir;
    let service;
    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xtech-test-'));
        fs.mkdirSync(path.join(tmpDir, 'supabase', 'migrations'), { recursive: true });
        // Create a minimal stub for the environments and logger
        const localEnvStub = {
            getDbUrl: async () => undefined,
            getAppliedMigrations: async () => [],
        };
        const loggerStub = {
            info: () => undefined,
            warn: () => undefined,
            error: () => undefined,
            debug: () => undefined,
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service = new migrationService_1.MigrationService(tmpDir, localEnvStub, undefined, loggerStub);
    });
    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('rejects empty name', async () => {
        await assert.rejects(service.createMigration(''), /empty/i);
    });
    test('rejects whitespace-only name', async () => {
        await assert.rejects(service.createMigration('   '), /empty/i);
    });
    test('rejects name with spaces', async () => {
        await assert.rejects(service.createMigration('create users'), /letters, numbers/i);
    });
    test('rejects name with special chars', async () => {
        await assert.rejects(service.createMigration('create-users!'), /letters, numbers/i);
    });
    test('rejects name with hyphens', async () => {
        await assert.rejects(service.createMigration('create-users'), /letters, numbers/i);
    });
    test('accepts valid alphanumeric name', async () => {
        const filePath = await service.createMigration('create_users');
        assert.ok(fs.existsSync(filePath));
        assert.ok(filePath.endsWith('.sql'));
        assert.ok(path.basename(filePath).includes('create_users'));
    });
    test('accepts name with numbers', async () => {
        const filePath = await service.createMigration('migration001');
        assert.ok(fs.existsSync(filePath));
    });
});
//# sourceMappingURL=migrationStatus.test.js.map