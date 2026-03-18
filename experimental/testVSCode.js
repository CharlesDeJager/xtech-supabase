import * as vscode from 'vscode';

const extensions = vscode.extensions.all.map((ext) => ext.id);
console.log('Installed extensions:', extensions);
