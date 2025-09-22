import { Database } from "../database/database";
import { Logger } from "../utils/logger/logger";
import Config from "../utils/config/config";

export default class Cli {
    static async Run(args: string[] = []): Promise<boolean> {
        const [command, subcommand] = args;

        const cfg = Config.load("./config.yaml");
        const log = new Logger(cfg.server.logging.level);
        const db = new Database(cfg.database.sql);

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
                // TODO: запуск сервиса
                await new Promise<void>(() => {
                    /* вечно «висим» до Ctrl+C */
                });
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
