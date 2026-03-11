import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../logger';
import { LocalEnvironment } from '../environment/localEnvironment';
import { LinkedEnvironment } from '../environment/linkedEnvironment';
import { Migration, MigrationStatus } from './migrationModel';

const MIGRATION_NAME_RE = /^[a-zA-Z0-9_]+$/;

export class MigrationService {
  private projectRoot: string;
  private localEnv: LocalEnvironment;
  private linkedEnv: LinkedEnvironment | undefined;
  private logger: Logger;

  constructor(
    projectRoot: string,
    localEnv: LocalEnvironment,
    linkedEnv: LinkedEnvironment | undefined,
    logger: Logger
  ) {
    this.projectRoot = projectRoot;
    this.localEnv = localEnv;
    this.linkedEnv = linkedEnv;
    this.logger = logger;
  }

  async listMigrations(): Promise<Migration[]> {
    const migrationsDir = path.join(this.projectRoot, 'supabase', 'migrations');

    let sqlFiles: string[] = [];
    try {
      if (fs.existsSync(migrationsDir)) {
        sqlFiles = fs
          .readdirSync(migrationsDir)
          .filter((f) => f.endsWith('.sql'))
          .sort();
      }
    } catch (err) {
      this.logger.error('Failed to read migrations directory', err);
    }

    let appliedLocal: string[] = [];
    let appliedLinked: string[] = [];

    try {
      appliedLocal = await this.localEnv.getAppliedMigrations();
    } catch (err) {
      this.logger.error('Failed to get local applied migrations', err);
    }

    try {
      if (this.linkedEnv) {
        appliedLinked = await this.linkedEnv.getAppliedMigrations();
      }
    } catch (err) {
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

  async createMigration(name: string): Promise<string> {
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

  static computeStatus(appliedLocal: boolean, appliedLinked: boolean): MigrationStatus {
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
