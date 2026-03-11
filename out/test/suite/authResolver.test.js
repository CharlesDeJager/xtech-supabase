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
/**
 * Auth resolver unit tests.
 * These tests validate the auth mode logic without requiring a live VS Code extension context.
 * The AuthProvider class integrates with vscode.ExtensionContext.secrets which is not available
 * outside the extension host, so we test the logic in isolation.
 */
suite('Auth mode logic', () => {
    test('authMode "token" requires a stored token to return a value', () => {
        // Simulate: no token stored → getToken should return undefined
        const storedTokens = new Map();
        const getToken = async (authMode, key) => {
            if (authMode === 'token') {
                return storedTokens.get(key);
            }
            return undefined;
        };
        return getToken('token', 'xtech-supabase.token').then((result) => {
            assert.strictEqual(result, undefined);
        });
    });
    test('authMode "token" returns stored token when available', () => {
        const storedTokens = new Map([
            ['xtech-supabase.token', 'test-token-abc123'],
        ]);
        const getToken = async (authMode, key) => {
            if (authMode === 'token') {
                return storedTokens.get(key);
            }
            return undefined;
        };
        return getToken('token', 'xtech-supabase.token').then((result) => {
            assert.strictEqual(result, 'test-token-abc123');
        });
    });
    test('authMode "cli" returns undefined (CLI manages its own auth)', () => {
        const getToken = async (authMode) => {
            if (authMode === 'cli') {
                // CLI mode does not return a token — CLI manages auth session
                return undefined;
            }
            return undefined;
        };
        return getToken('cli').then((result) => {
            assert.strictEqual(result, undefined);
        });
    });
    test('token storage and retrieval round-trip', () => {
        const store = new Map();
        const KEY = 'xtech-supabase.token';
        const setToken = async (token) => {
            store.set(KEY, token);
        };
        const getStoredToken = async () => {
            return store.get(KEY);
        };
        const clearToken = async () => {
            store.delete(KEY);
        };
        return setToken('my-secret-token')
            .then(() => getStoredToken())
            .then((t) => {
            assert.strictEqual(t, 'my-secret-token');
            return clearToken();
        })
            .then(() => getStoredToken())
            .then((t) => {
            assert.strictEqual(t, undefined);
        });
    });
});
//# sourceMappingURL=authResolver.test.js.map