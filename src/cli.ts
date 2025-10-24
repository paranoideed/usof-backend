import log from "./utils/logger";
import database from "./repo/sql/database";
import app from "./app";

export default class Cli {
    static async Run(args: string[] = []): Promise<boolean> {
        const [command, subcommand] = args;

        switch (`${command} ${subcommand || ''}`.trim()) {
            case 'migrate up':
                log.info('Starting migrations: up');
                await database.up();
                log.info('Migrations up completed.');
                break;

            case 'migrate down':
                log.info('Starting migrations: down');
                await database.down();
                log.info('Migrations down completed.');
                break;

            case 'service run': {
                log.info('Service is running. Press Ctrl+C to stop.');
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