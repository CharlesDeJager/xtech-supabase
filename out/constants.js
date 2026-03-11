"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_TOKEN_KEY = exports.CONFIG_LINKED_PROJECT_REF = exports.CONFIG_LOCAL_DB_URL = exports.CONFIG_REFRESH_INTERVAL = exports.CONFIG_AUTH_MODE = exports.CONFIG_PROJECT_PATH = exports.Commands = exports.VIEW_ID = exports.OUTPUT_CHANNEL_NAME = exports.EXTENSION_ID = void 0;
exports.EXTENSION_ID = 'xtech-supabase';
exports.OUTPUT_CHANNEL_NAME = 'XTECH Supabase';
exports.VIEW_ID = 'xtech-supabase.supabaseExplorer';
var Commands;
(function (Commands) {
    Commands["Refresh"] = "xtech-supabase.refresh";
    Commands["CreateMigration"] = "xtech-supabase.createMigration";
    Commands["SetToken"] = "xtech-supabase.setToken";
    Commands["ClearToken"] = "xtech-supabase.clearToken";
})(Commands || (exports.Commands = Commands = {}));
exports.CONFIG_PROJECT_PATH = 'xtech-supabase.projectPath';
exports.CONFIG_AUTH_MODE = 'xtech-supabase.authMode';
exports.CONFIG_REFRESH_INTERVAL = 'xtech-supabase.refreshInterval';
exports.CONFIG_LOCAL_DB_URL = 'xtech-supabase.localDbUrl';
exports.CONFIG_LINKED_PROJECT_REF = 'xtech-supabase.linkedProjectRef';
exports.SECRET_TOKEN_KEY = 'xtech-supabase.token';
//# sourceMappingURL=constants.js.map