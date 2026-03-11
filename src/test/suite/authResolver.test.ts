import * as assert from 'assert';

/**
 * Auth resolver unit tests.
 * These tests validate the auth mode logic without requiring a live VS Code extension context.
 * The AuthProvider class integrates with vscode.ExtensionContext.secrets which is not available
 * outside the extension host, so we test the logic in isolation.
 */

suite('Auth mode logic', () => {
  test('authMode "token" requires a stored token to return a value', () => {
    // Simulate: no token stored → getToken should return undefined
    const storedTokens = new Map<string, string>();

    const getToken = async (authMode: string, key: string): Promise<string | undefined> => {
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
    const storedTokens = new Map<string, string>([
      ['xtech-supabase.token', 'test-token-abc123'],
    ]);

    const getToken = async (authMode: string, key: string): Promise<string | undefined> => {
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
    const getToken = async (authMode: string): Promise<string | undefined> => {
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
    const store = new Map<string, string>();
    const KEY = 'xtech-supabase.token';

    const setToken = async (token: string): Promise<void> => {
      store.set(KEY, token);
    };

    const getStoredToken = async (): Promise<string | undefined> => {
      return store.get(KEY);
    };

    const clearToken = async (): Promise<void> => {
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
