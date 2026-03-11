import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { SupabaseProjectDiscovery } from '../../projectDiscovery';

suite('SupabaseProjectDiscovery', () => {
  let tmpDir: string;
  let discovery: SupabaseProjectDiscovery;

  setup(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'xtech-discover-'));
    discovery = new SupabaseProjectDiscovery();
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
    const result = await discovery.discover(folders as any);
    assert.strictEqual(result, undefined);
  });

  test('returns project root when supabase/config.toml exists', async () => {
    const supabaseDir = path.join(tmpDir, 'supabase');
    fs.mkdirSync(supabaseDir);
    fs.writeFileSync(path.join(supabaseDir, 'config.toml'), '[db]\nport = 54322\n');

    const folders = [{ uri: { fsPath: tmpDir }, name: 'test', index: 0 }];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await discovery.discover(folders as any);
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
