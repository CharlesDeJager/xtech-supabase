import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { MigrationService } from '../../migrations/migrationService';
import { MigrationStatus } from '../../migrations/migrationModel';

suite('MigrationService.computeStatus', () => {
  test('pending: false, false', () => {
    const status: MigrationStatus = MigrationService.computeStatus(false, false);
    assert.strictEqual(status, 'pending');
  });

  test('applied-local: true, false', () => {
    const status: MigrationStatus = MigrationService.computeStatus(true, false);
    assert.strictEqual(status, 'applied-local');
  });

  test('applied-linked: false, true', () => {
    const status: MigrationStatus = MigrationService.computeStatus(false, true);
    assert.strictEqual(status, 'applied-linked');
  });

  test('applied-both: true, true', () => {
    const status: MigrationStatus = MigrationService.computeStatus(true, true);
    assert.strictEqual(status, 'applied-both');
  });
});

suite('MigrationService.createMigration name validation', () => {
  let tmpDir: string;
  let service: MigrationService;

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
    service = new MigrationService(tmpDir, localEnvStub as any, undefined, loggerStub as any);
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
