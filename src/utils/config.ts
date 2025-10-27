import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

function req<T>(v: T | undefined | null, key: string): T {
    if (v === undefined || v === null || v === '' || (typeof v === 'number' && isNaN(v))) {
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
    aws:{
        region: string;
        access_key_id: string;
        secret_access_key: string;
        bucket_name: string;
        public_base: string;
    }
}

class Config {
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

    aws:{
        region: string;
        access_key_id: string;
        secret_access_key: string;
        bucket_name: string;
        public_base: string;
    }

    constructor(raw: RawConfig) {
        this.server = {
            host: raw.server?.host,
            port: raw.server?.port,
            logging: {
                level:  raw.server?.logging?.level,
            },
        };

        this.jwt = {
            ttl:       raw.jwt?.ttl,
            secretKey: raw.jwt?.secret_key,
        };

        this.database = {
            sql: {
                host:     raw.database?.sql?.host,
                port:     raw.database?.sql?.port,
                user:     raw.database?.sql?.user,
                password: raw.database?.sql?.password,
                name:     raw.database?.sql?.name,
            },
        };

        this.aws = {
            region:            raw.aws?.region,
            access_key_id:     raw.aws?.access_key_id,
            secret_access_key: raw.aws?.secret_access_key,
            bucket_name:       raw.aws?.bucket_name,
            public_base:       raw.aws?.public_base,
        };

        this.server.port = Number(process.env.PORT) || this.server.port;

        this.database.sql.host = process.env.DB_HOST || this.database.sql.host;
        this.database.sql.port = Number(process.env.DB_PORT) || this.database.sql.port;
        this.database.sql.user = process.env.DB_USER || this.database.sql.user;
        this.database.sql.password = process.env.DB_PASSWORD || this.database.sql.password;
        this.database.sql.name = process.env.DB_DATABASE || this.database.sql.name;

        this.aws.access_key_id = process.env.AWS_ACCESS_KEY_ID || this.aws.access_key_id;
        this.aws.secret_access_key = process.env.AWS_SECRET_ACCESS_KEY || this.aws.secret_access_key;
        this.aws.region = process.env.AWS_REGION || this.aws.region;
        this.aws.bucket_name = process.env.AWS_BUCKET_NAME || this.aws.bucket_name;

        this.server.host = req(this.server.host, 'server.host');
        this.server.port = req(this.server.port, 'server.port');
        this.server.logging.level = req(this.server.logging.level, 'server.logging.level');

        this.jwt.ttl = req(this.jwt.ttl, 'jwt.ttl');
        this.jwt.secretKey = req(this.jwt.secretKey, 'jwt.secret_key');

        this.database.sql.host = req(this.database.sql.host, 'database.sql.host');
        this.database.sql.port = req(this.database.sql.port, 'database.sql.port');
        this.database.sql.user = req(this.database.sql.user, 'database.sql.user');
        this.database.sql.password = req(this.database.sql.password, 'database.sql.password');
        this.database.sql.name = req(this.database.sql.name, 'database.sql.name');

        this.aws.region = req(this.aws.region, 'aws.region');
        this.aws.access_key_id = req(this.aws.access_key_id, 'aws.access_key_id');
        this.aws.secret_access_key = req(this.aws.secret_access_key, 'aws.secret_access_key');
        this.aws.bucket_name = req(this.aws.bucket_name, 'aws.bucket_name');
        this.aws.public_base = req(this.aws.public_base, 'aws.public_base');
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

        let raw: RawConfig;
        try {
            const text = fs.readFileSync(absPath, 'utf8');
            raw = yaml.load(text) as RawConfig;
        } catch (e) {
            console.warn(`[Config] Config file is not set: ${absPath}`);
            raw = {
                server: { logging: {} },
                jwt: {},
                database: { sql: {} },
                aws: {}
            } as any;
        }

        return new Config(raw);
    }
}

const configPath  = process.env.KV_VIPER_FILE;

if (!configPath) {
    console.error("[FATAL] 'KV_VIPER_FILE' is null.");
    console.error("Set 'KV_VIPER_FILE' environment variable to the path of the config YAML file.");
    process.exit(1);
}

const config = Config.load(configPath);
export default config;