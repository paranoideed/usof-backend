"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const winston_1 = require("winston");
class Logger {
    constructor(level) {
        this.logger = (0, winston_1.createLogger)({
            level,
            format: winston_1.format.combine(winston_1.format.colorize({ all: true }), // цвета в консоли
            winston_1.format.timestamp(), // добавляем timestamp
            winston_1.format.printf((_a) => {
                var { timestamp, level, message } = _a, meta = __rest(_a, ["timestamp", "level", "message"]);
                const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
                return `[${timestamp}] [${level}] ${message}${metaStr ? ` ${metaStr}` : ''}`;
            })),
            transports: [new winston_1.transports.Console()],
        });
    }
    info(message, meta) {
        this.logger.info(message, meta);
    }
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    error(message, meta) {
        this.logger.error(message, meta);
    }
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    log(level, message, meta) {
        this.logger.log(level, message, meta);
    }
}
exports.Logger = Logger;
