import { Database } from "./data/database";
import {config} from "./utils/config/config";
import {App} from "./app";
import {log} from "./utils/logger/logger";

export default class Cli {
    static async Run(args: string[] = []): Promise<boolean> {
        const [command, subcommand] = args;
        const db = new Database(config.database.sql);

        switch (`${command} ${subcommand || ''}`.trim()) {
            case 'migrate up':
                log.info('Starting migrations: up');
                await db.up();
                log.info('Migrations up completed.');
                break;

            case 'migrate down':
                log.info('Starting migrations: down');
                await db.down();
                log.info('Migrations down completed.');
                break;

            case 'service run': {
                log.info('Service is running. Press Ctrl+C to stop.');
                const app = new App();
                await app.run();

                return true;
            }

            default:
                log.error(`Unknown command: ${args.join(' ')}`);
                log.error(
                    `Usage:
            \t node index.js service run \n
            \t node index.js migrate up \n
            \t node index.js migrate down \n`
                );
                return false;
        }

        return true;
    }
}