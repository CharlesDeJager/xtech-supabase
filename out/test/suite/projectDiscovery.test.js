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
const projectDiscovery_1 = require("../../projectDiscovery");
suite('SupabaseProjectDiscovery', () => {
    let tmpDir;
    let discovery;
    setup(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xtech-discover-'));
        discovery = new projectDiscovery_1.SupabaseProjectDiscovery();
    });
    teardown(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });
    test('returns undefined when workspaceFolders is undefined', async () => {
        const result = await discovery.discover(undefined);
        assert.strictEqual(result, undefined);
    });
    test('returns undefined when workspaceFolders is empty', async () => {
        const result = await discovery.discover([]);
        assert.strictEqual(result, undefined);
    });
    test('returns undefined when no supabase/config.toml exists', async () => {
        const folders = [{ uri: { fsPath: tmpDir }, name: 'test', index: 0 }];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await discovery.discover(folders);
        assert.strictEqual(result, undefined);
    });
    test('returns project root when supabase/config.toml exists', async () => {
        const supabaseDir = path.join(tmpDir, 'supabase');
        fs.mkdirSync(supabaseDir);
        fs.writeFileSync(path.join(supabaseDir, 'config.toml'), '[db]\nport = 54322\n');
        const folders = [{ uri: { fsPath: tmpDir }, name: 'test', index: 0 }];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const result = await discovery.discover(folders);
        assert.strictEqual(result, tmpDir);
    });
    test('getMigrationsPath returns correct path', async () => {
        const result = await discovery.getMigrationsPath('/some/project');
        assert.strictEqual(result, path.join('/some/project', 'supabase', 'migrations'));
    });
    test('getConfigPath returns correct path', async () => {
        const result = await discovery.getConfigPath('/some/project');
        assert.strictEqual(result, path.join('/some/project', 'supabase', 'config.toml'));
    });
});
//# sourceMappingURL=projectDiscovery.test.js.map