import knex from 'knex';
import config from '../config/config.js';

export class Database {
    constructor() {
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

    async transaction(fn) {
        return this.knex.transaction(async trx => {
            const dbCtx = {
                // users:       this.users(trx('users')),
                // rooms:       this.rooms(trx('rooms')),
                // cards:       this.cards(trx('cards')),
                // players: this.players(trx('players')),
            };
            return fn(dbCtx);
        });
    }

    async destroy() {
        await this.knex.destroy();
    }
}

export const database = new Database();
