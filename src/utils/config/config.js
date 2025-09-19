import fs       from 'fs';
import path     from 'path';
import yaml     from 'js-yaml';


function req(v, key) {
    if (v === undefined || v === null || v === '') {
        throw new Error(`Missing required config: ${key}`);
    }
    return v;
}

class Config {
    constructor(raw) {
        this.server = {
            host:  raw.server.host,
            port: raw.server.port,
            logging: {
                level:  raw.server.logging.level,
                format: raw.server.logging.format,
            },
        };

        this.jwt = {
            secretKey: raw.jwt.secret_key,
        };

        this.database = {
            sql: {
                host: raw.database.sql.host,
                port: raw.database.sql.port,
                user: raw.database.sql.user,
                password: raw.database.sql.password,
                name: raw.database.sql.name,
            },
        };
    }

    /**
     * Download YAML config file and parse it into Config object
     * @param {string} filePath — Path to the YAML config file
     * @returns {Config}
     */
    static load(filePath) {
        const absPath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
        const text    = fs.readFileSync(absPath, 'utf8');
        const raw     = yaml.load(text);

        return new Config(raw);
    }
}

const configPath = process.env.KV_VIPER_FILE || './config.yaml';
const config = Config.load(configPath);
export default config;