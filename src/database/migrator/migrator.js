import fs from 'fs';
import path from 'path';
import { database } from '../database.js';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'src', 'database', 'migrations');

class Migrator {
    static async up() {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.up.sql'))
            .sort();

        for (const file of files) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Running migration up: ${file}`);
            await database.knex.raw(sql);
        }
        console.log('All up migrations applied.');

        process.exit(0);
    }

    static async down() {
        const files = fs.readdirSync(MIGRATIONS_DIR)
            .filter(f => f.endsWith('.down.sql'))
            .sort().reverse();

        for (const file of files) {
            const filePath = path.join(MIGRATIONS_DIR, file);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Running migration down: ${file}`);
            await database.knex.raw(sql);

        }
        console.log('All down migrations applied.');

        process.exit(0);
    }
}

export default Migrator;