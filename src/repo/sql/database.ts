import fs from "fs";
import path from "path";
import knex, { Knex } from 'knex';

import config from "../../utils/config";

import UsersQ from './users';
import CategoriesQ from './categories';
import PostsQ from './posts';
import CommentsQ from './comments';
import PostCategoriesQ from './post_categories';
import PostLikesQ from "./post_likes";
import CommentLikesQ from "./comment_likes";

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'assets', 'migrations');

export interface SqlConfig {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
}

export class Database {
    private knex: Knex;

    constructor(config: SqlConfig) {
        this.knex = knex({
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

    users(builder: Knex.QueryBuilder = this.knex('users')): UsersQ {
        return new UsersQ(builder);
    }

    categories(builder: Knex.QueryBuilder = this.knex('categories')): CategoriesQ {
        return new CategoriesQ(builder);
    }

    posts(builder: Knex.QueryBuilder = this.knex('posts')): PostsQ {
        return new PostsQ(builder);
    }

    postLikes(builder: Knex.QueryBuilder = this.knex('post_likes')): PostLikesQ {
        return new PostLikesQ(builder);
    }

    postCategories(builder: Knex.QueryBuilder = this.knex('post_categories')): PostCategoriesQ {
        return new PostCategoriesQ(builder);
    }

    comments(builder: Knex.QueryBuilder = this.knex('comments')): CommentsQ {
        return new CommentsQ(builder);
    }

    commentLikes(builder: Knex.QueryBuilder = this.knex('comment_likes')): CommentLikesQ {
        return new CommentLikesQ(builder);
    }

    async transaction<T>(fn: (dbCtx: {
        users: UsersQ;
        categories: CategoriesQ;
        posts: PostsQ;
        postLikes: PostLikesQ;
        postCategories: PostCategoriesQ;
        comments: CommentsQ;
        commentLikes: CommentLikesQ;
    }) => Promise<T>): Promise<T> {
        return this.knex.transaction(async trx => {
            const dbCtx = {
                users: this.users(trx('users')),
                categories: this.categories(trx('categories')),
                posts: this.posts(trx('posts')),
                postLikes: this.postLikes(trx('post_likes')),
                postCategories: this.postCategories(trx('post_categories')),
                comments: this.comments(trx('comments')),
                commentLikes: this.commentLikes(trx('comment_likes')),
            };
            return fn(dbCtx);
        });
    }

    async up(): Promise<void> {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.up.sql'))
            .sort();

        try {
            for (const file of files) {
                const filePath = path.join(MIGRATIONS_DIR, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                console.log(`Running migration up: ${file}`);
                await this.knex.raw(sql);
            }
            console.log('All up migrations applied.');
        } finally {
            await this.destroy();
        }
    }

    async down(): Promise<void> {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.down.sql'))
            .sort()
            .reverse();

        try {
            for (const file of files) {
                const filePath = path.join(MIGRATIONS_DIR, file);
                const sql = fs.readFileSync(filePath, 'utf8');
                console.log(`Running migration down: ${file}`);
                await this.knex.raw(sql);
            }
            console.log('All down migrations applied.');
        } finally {
            await this.destroy();
        }
    }


    async destroy(): Promise<void> {
        await this.knex.destroy();
    }
}

const database = new Database(config.database.sql);
export default database;