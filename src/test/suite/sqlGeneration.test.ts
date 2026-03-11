import * as assert from 'assert';
import {
  generateCreateTableSql,
  generateSelectSql,
  generateFunctionSql,
  generatePolicySql,
  generateTriggerSql,
  generateIndexSql,
  generateRoleSql,
  generateStorageBucketSql,
} from '../../commands/sqlGenerators';
import { ColumnRow, FunctionDetailsRow, PolicyDetailsRow, TriggerDetailsRow, IndexDetailsRow, RoleDetailsRow } from '../../database/databaseService';

suite('SQL generation helpers', () => {
  suite('generateSelectSql', () => {
    test('produces a SELECT * statement', () => {
      const sql = generateSelectSql('public', 'users');
      assert.strictEqual(sql, 'SELECT * FROM "public"."users";');
    });
  });

  suite('generateCreateTableSql', () => {
    test('falls back to SELECT when no columns provided', () => {
      const sql = generateCreateTableSql('public', 'users', []);
      assert.strictEqual(sql, 'SELECT * FROM "public"."users";');
    });

    test('generates CREATE TABLE with columns', () => {
      const columns: ColumnRow[] = [
        { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: null, ordinal_position: 1 },
        { column_name: 'name', data_type: 'text', is_nullable: 'YES', column_default: null, ordinal_position: 2 },
        { column_name: 'score', data_type: 'numeric', is_nullable: 'NO', column_default: '0', ordinal_position: 3 },
      ];
      const sql = generateCreateTableSql('myschema', 'scores', columns);
      assert.ok(sql.startsWith('CREATE TABLE IF NOT EXISTS "myschema"."scores"'));
      assert.ok(sql.includes('"id" integer NOT NULL'));
      assert.ok(sql.includes('"name" text'));
      assert.ok(sql.includes('"score" numeric NOT NULL DEFAULT 0'));
    });
  });

  suite('generateFunctionSql', () => {
    test('returns function definition', () => {
      const details: FunctionDetailsRow[] = [
        {
          function_name: 'my_func',
          schema: 'public',
          argument_signature: '',
          return_type: 'void',
          language: 'sql',
          volatility: 'VOLATILE',
          security_definer: false,
          definition: 'CREATE OR REPLACE FUNCTION public.my_func() RETURNS void LANGUAGE sql AS $$ SELECT 1; $$;',
        },
      ];
      const sql = generateFunctionSql(details);
      assert.ok(sql.includes('CREATE OR REPLACE FUNCTION public.my_func()'));
    });

    test('joins multiple overloads with blank line', () => {
      const details: FunctionDetailsRow[] = [
        {
          function_name: 'my_func',
          schema: 'public',
          argument_signature: '',
          return_type: 'void',
          language: 'sql',
          volatility: 'VOLATILE',
          security_definer: false,
          definition: 'DEFINITION_1',
        },
        {
          function_name: 'my_func',
          schema: 'public',
          argument_signature: 'x integer',
          return_type: 'void',
          language: 'sql',
          volatility: 'VOLATILE',
          security_definer: false,
          definition: 'DEFINITION_2',
        },
      ];
      const sql = generateFunctionSql(details);
      assert.ok(sql.includes('DEFINITION_1'));
      assert.ok(sql.includes('DEFINITION_2'));
    });
  });

  suite('generatePolicySql', () => {
    test('generates CREATE POLICY with USING and WITH CHECK', () => {
      const detail: PolicyDetailsRow = {
        schema: 'public',
        table_name: 'posts',
        policy_name: 'user_policy',
        cmd: 'ALL',
        roles: ['authenticated'],
        permissive: 'PERMISSIVE',
        using_expression: 'user_id = auth.uid()',
        with_check: 'user_id = auth.uid()',
      };
      const sql = generatePolicySql(detail);
      assert.ok(sql.includes('CREATE POLICY "user_policy"'));
      assert.ok(sql.includes('ON "public"."posts"'));
      assert.ok(sql.includes('AS PERMISSIVE'));
      assert.ok(sql.includes('FOR ALL'));
      assert.ok(sql.includes('USING (user_id = auth.uid())'));
      assert.ok(sql.includes('WITH CHECK (user_id = auth.uid())'));
    });

    test('generates CREATE POLICY with array roles', () => {
      const detail: PolicyDetailsRow = {
        schema: 'public',
        table_name: 'items',
        policy_name: 'read_policy',
        cmd: 'SELECT',
        roles: ['anon', 'authenticated'],
        permissive: 'PERMISSIVE',
        using_expression: 'true',
        with_check: null,
      };
      const sql = generatePolicySql(detail);
      assert.ok(sql.includes('TO anon, authenticated'));
      assert.ok(!sql.includes('WITH CHECK'));
    });

    test('generates RESTRICTIVE policy', () => {
      const detail: PolicyDetailsRow = {
        schema: 'public',
        table_name: 'items',
        policy_name: 'restrict_policy',
        cmd: 'INSERT',
        roles: 'public',
        permissive: 'RESTRICTIVE',
        using_expression: null,
        with_check: null,
      };
      const sql = generatePolicySql(detail);
      assert.ok(sql.includes('AS RESTRICTIVE'));
    });
  });

  suite('generateTriggerSql', () => {
    test('returns empty string for no details', () => {
      const sql = generateTriggerSql([]);
      assert.strictEqual(sql, '');
    });

    test('generates CREATE OR REPLACE TRIGGER', () => {
      const details: TriggerDetailsRow[] = [
        {
          schema: 'public',
          trigger_name: 'my_trigger',
          table_name: 'orders',
          timing: 'BEFORE',
          event: 'INSERT',
          orientation: 'ROW',
          action_statement: 'EXECUTE FUNCTION notify_order()',
        },
      ];
      const sql = generateTriggerSql(details);
      assert.ok(sql.includes('CREATE OR REPLACE TRIGGER "my_trigger"'));
      assert.ok(sql.includes('BEFORE INSERT'));
      assert.ok(sql.includes('ON "public"."orders"'));
      assert.ok(sql.includes('FOR EACH ROW'));
      assert.ok(sql.includes('EXECUTE FUNCTION notify_order()'));
    });
  });

  suite('generateIndexSql', () => {
    test('appends semicolon when missing', () => {
      const detail: IndexDetailsRow = {
        schema: 'public',
        table_name: 'users',
        index_name: 'users_email_idx',
        indexdef: 'CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email)',
      };
      const sql = generateIndexSql(detail);
      assert.ok(sql.endsWith(';'));
    });

    test('does not double-append semicolon', () => {
      const detail: IndexDetailsRow = {
        schema: 'public',
        table_name: 'users',
        index_name: 'users_email_idx',
        indexdef: 'CREATE UNIQUE INDEX users_email_idx ON public.users USING btree (email);',
      };
      const sql = generateIndexSql(detail);
      assert.ok(!sql.endsWith(';;'));
    });
  });

  suite('generateRoleSql', () => {
    test('generates CREATE ROLE with attributes', () => {
      const detail: RoleDetailsRow = {
        role_name: 'myapp_user',
        rolsuper: false,
        rolinherit: true,
        rolcreaterole: false,
        rolcreatedb: false,
        rolcanlogin: true,
        rolreplication: false,
        rolbypassrls: false,
        rolconnlimit: -1,
        valid_until: null,
      };
      const sql = generateRoleSql(detail);
      assert.ok(sql.includes('CREATE ROLE "myapp_user"'));
      assert.ok(sql.includes('NOSUPERUSER'));
      assert.ok(sql.includes('INHERIT'));
      assert.ok(sql.includes('LOGIN'));
      assert.ok(sql.includes('CONNECTION LIMIT -1'));
      assert.ok(!sql.includes('VALID UNTIL'));
    });

    test('includes VALID UNTIL when set', () => {
      const detail: RoleDetailsRow = {
        role_name: 'temp_role',
        rolsuper: false,
        rolinherit: true,
        rolcreaterole: false,
        rolcreatedb: false,
        rolcanlogin: true,
        rolreplication: false,
        rolbypassrls: false,
        rolconnlimit: 5,
        valid_until: '2025-12-31',
      };
      const sql = generateRoleSql(detail);
      assert.ok(sql.includes("VALID UNTIL '2025-12-31'"));
    });
  });

  suite('generateStorageBucketSql', () => {
    test('generates INSERT for public bucket', () => {
      const sql = generateStorageBucketSql('my-bucket-id', 'my-bucket', true);
      assert.ok(sql.includes("INSERT INTO storage.buckets"));
      assert.ok(sql.includes("'my-bucket-id'"));
      assert.ok(sql.includes("'my-bucket'"));
      assert.ok(sql.includes('true'));
      assert.ok(sql.includes('ON CONFLICT (id) DO NOTHING'));
    });

    test('generates INSERT for private bucket', () => {
      const sql = generateStorageBucketSql('private-id', 'private-bucket', false);
      assert.ok(sql.includes('false'));
    });
  });
});
