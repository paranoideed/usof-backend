import knex from 'knex';
import UsersQ from "./users.js";
import CategoriesQ from "./categories.js";
import PostsQ from "./posts.js";
import CommentsQ from "./comments.js";
import PostCategoriesQ from "./post_categories.js";

export class Database {
    constructor(config) {
        this.knex = knex({
            client:  'mysql2',
            connection: {
                host:     config.database.sql.host,
                port:     config.database.sql.port,
                user:     config.database.sql.user,
                password: config.database.sql.password,
                database: config.database.sql.name,
                multipleStatements: true
            },
            pool: { min: 2, max: 10 },
        });
    }

    users(builder = this.knex('users')) {
        return new UsersQ(builder);
    }

    categories(builder = this.knex('categories')) {
        return new CategoriesQ(builder);
    }

    posts(builder = this.knex('posts')) {
        return new PostsQ(builder);
    }

    postCategories(builder = this.knex('post_categories')) {
        return new PostCategoriesQ(builder);
    }

    comments(builder = this.knex('comments')) {
        return new CommentsQ(builder);
    }


    async transaction(fn) {
        return this.knex.transaction(async trx => {
            const dbCtx = {
                users:       this.users(trx('users')),
                categories:  this.categories(trx('categories')),
                posts:       this.posts(trx('posts')),
                postCategories: this.postCategories(trx('post_categories')),
                comments:    this.comments(trx('comments')),
            };
            return fn(dbCtx);
        });
    }

    async destroy() {
        await this.knex.destroy();
    }
}

export const database = new Database();
