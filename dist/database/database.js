"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Database = void 0;
const knex_1 = __importDefault(require("knex"));
const users_1 = __importDefault(require("./users"));
const categories_1 = __importDefault(require("./categories"));
const posts_1 = __importDefault(require("./posts"));
const comments_1 = __importDefault(require("./comments"));
const post_categories_1 = __importDefault(require("./post_categories"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const MIGRATIONS_DIR = path_1.default.resolve(process.cwd(), 'src', 'database', 'migrations');
class Database {
    constructor(config) {
        this.knex = (0, knex_1.default)({
            client: 'mysql2',
            connection: {
                host: config.host,
                port: config.port,
                user: config.user,
                password: config.password,
                database: config.name,
                multipleStatements: true,
            },
            pool: { min: 2, max: 10 },
        });
    }
    users(builder = this.knex('users')) {
        return new users_1.default(builder);
    }
    categories(builder = this.knex('categories')) {
        return new categories_1.default(builder);
    }
    posts(builder = this.knex('posts')) {
        return new posts_1.default(builder);
    }
    postCategories(builder = this.knex('post_categories')) {
        return new post_categories_1.default(builder);
    }
    comments(builder = this.knex('comments')) {
        return new comments_1.default(builder);
    }
    transaction(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.knex.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const dbCtx = {
                    users: this.users(trx('users')),
                    categories: this.categories(trx('categories')),
                    posts: this.posts(trx('posts')),
                    postCategories: this.postCategories(trx('post_categories')),
                    comments: this.comments(trx('comments')),
                };
                return fn(dbCtx);
            }));
        });
    }
    up() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs_1.default.readdirSync(MIGRATIONS_DIR)
                .filter(f => f.endsWith('.up.sql'))
                .sort();
            try {
                for (const file of files) {
                    const filePath = path_1.default.join(MIGRATIONS_DIR, file);
                    const sql = fs_1.default.readFileSync(filePath, 'utf8');
                    console.log(`Running migration up: ${file}`);
                    yield this.knex.raw(sql);
                }
                console.log('All up migrations applied.');
            }
            finally {
                yield this.destroy(); // важен в любом случае
            }
        });
    }
    down() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = fs_1.default.readdirSync(MIGRATIONS_DIR)
                .filter(f => f.endsWith('.down.sql'))
                .sort()
                .reverse();
            try {
                for (const file of files) {
                    const filePath = path_1.default.join(MIGRATIONS_DIR, file);
                    const sql = fs_1.default.readFileSync(filePath, 'utf8');
                    console.log(`Running migration down: ${file}`);
                    yield this.knex.raw(sql);
                }
                console.log('All down migrations applied.');
            }
            finally {
                yield this.destroy();
            }
        });
    }
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.knex.destroy();
        });
    }
}
exports.Database = Database;
