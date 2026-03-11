/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

// Register a vscode mock so that modules importing 'vscode' work outside the
// extension host (unit tests don't need the real VS Code API).
// We patch Module._resolveFilename to redirect 'vscode' to our stub file.
const Module = require('module') as {
  _resolveFilename: (request: string, ...args: unknown[]) => string;
};
const mockPath = path.resolve(__dirname, './mocks/vscode.js');
const origResolve = Module._resolveFilename.bind(Module);
Module._resolveFilename = function (
  request: string,
  ...args: unknown[]
): string {
  if (request === 'vscode') {
    return mockPath;
  }
  return origResolve(request, ...args);
};

async function main(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', color: true, timeout: 10000 });
  const testsRoot = path.resolve(__dirname, './suite');
  const files = await glob('**/*.test.js', { cwd: testsRoot });
  files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}

main().catch((err) => {
  process.stderr.write(`${String(err)}\n`);
  process.exit(1);
});
