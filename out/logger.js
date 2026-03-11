"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
class Logger {
    constructor(channel) {
        this.channel = channel;
    }
    static getInstance(channel) {
        if (!Logger.instance) {
            Logger.instance = new Logger(channel);
        }
        return Logger.instance;
    }
    static resetInstance() {
        Logger.instance = undefined;
    }
    timestamp() {
        return new Date().toISOString();
    }
    info(msg) {
        this.channel.appendLine(`[INFO  ${this.timestamp()}] ${msg}`);
    }
    warn(msg) {
        this.channel.appendLine(`[WARN  ${this.timestamp()}] ${msg}`);
    }
    error(msg, err) {
        const errStr = err instanceof Error ? ` — ${err.message}` : err ? ` — ${String(err)}` : '';
        this.channel.appendLine(`[ERROR ${this.timestamp()}] ${msg}${errStr}`);
    }
    debug(msg) {
        this.channel.appendLine(`[DEBUG ${this.timestamp()}] ${msg}`);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map