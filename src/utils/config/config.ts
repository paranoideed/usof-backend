import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function req<T>(v: T | undefined | null, key: string): T {
    if (v === undefined || v === null || v === '') {
        throw new Error(`Missing required config: ${key}`);
    }
    return v;
}

interface RawConfig {
    server: {
        host: string;
        port: number;
        logging: {
            level: string;
            format: string;
        };
    };
    jwt: {
        secret_key: string;
        ttl: number;
    };
    database: {
        sql: {
            host: string;
            port: number;
            user: string;
            password: string;
            name: string;
        };
    };
}

export default class Config {
    server: {
        host: string;
        port: number;
        logging: {
            level: string;
        };
    };

    jwt: {
        secretKey: string;
        ttl: number;
    };

    database: {
        sql: {
            host: string;
            port: number;
            user: string;
            password: string;
            name: string;
        };
    };

    constructor(raw: RawConfig) {
        this.server = {
            host: req(raw.server.host, 'server.host'),
            port: req(raw.server.port, 'server.port'),
            logging: {
                level:  req(raw.server.logging.level, 'server.logging.level'),
            },
        };

        this.jwt = {
            ttl:       req(raw.jwt.ttl, 'jwt.ttl'),
            secretKey: req(raw.jwt.secret_key, 'jwt.secret_key'),
        };

        this.database = {
            sql: {
                host:     req(raw.database.sql.host, 'database.sql.host'),
                port:     req(raw.database.sql.port, 'database.sql.port'),
                user:     req(raw.database.sql.user, 'database.sql.user'),
                password: req(raw.database.sql.password, 'database.sql.password'),
                name:     req(raw.database.sql.name, 'database.sql.name'),
            },
        };
    }

    /**
     * Download YAML config file and parse it into Config object
     * @param filePath — Path to the YAML config file
     * @returns Config
     */
    static load(filePath: string): Config {
        const absPath = path.isAbsolute(filePath)
            ? filePath
            : path.resolve(process.cwd(), filePath);
        const text = fs.readFileSync(absPath, 'utf8');
        const raw = yaml.load(text) as RawConfig;

        return new Config(raw);
    }
}

const configPath: string = process.env.KV_VIPER_FILE || './config.yaml';
const config = Config.load(configPath);

export { config };
