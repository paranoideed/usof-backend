"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const js_yaml_1 = __importDefault(require("js-yaml"));
function req(v, key) {
    if (v === undefined || v === null || v === '') {
        throw new Error(`Missing required config: ${key}`);
    }
    return v;
}
class Config {
    constructor(raw) {
        this.server = {
            host: req(raw.server.host, 'server.host'),
            port: req(raw.server.port, 'server.port'),
            logging: {
                level: req(raw.server.logging.level, 'server.logging.level'),
            },
        };
        this.jwt = {
            secretKey: req(raw.jwt.secret_key, 'jwt.secret_key'),
        };
        this.database = {
            sql: {
                host: req(raw.database.sql.host, 'database.sql.host'),
                port: req(raw.database.sql.port, 'database.sql.port'),
                user: req(raw.database.sql.user, 'database.sql.user'),
                password: req(raw.database.sql.password, 'database.sql.password'),
                name: req(raw.database.sql.name, 'database.sql.name'),
            },
        };
    }
    /**
     * Download YAML config file and parse it into Config object
     * @param filePath — Path to the YAML config file
     * @returns Config
     */
    static load(filePath) {
        const absPath = path_1.default.isAbsolute(filePath)
            ? filePath
            : path_1.default.resolve(process.cwd(), filePath);
        const text = fs_1.default.readFileSync(absPath, 'utf8');
        const raw = js_yaml_1.default.load(text);
        return new Config(raw);
    }
}
exports.default = Config;
const configPath = process.env.KV_VIPER_FILE || './config.yaml';
const config = Config.load(configPath);
exports.config = config;
