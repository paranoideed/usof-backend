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
const database_1 = require("../database/database");
const logger_1 = require("../utils/logger/logger");
const config_1 = __importDefault(require("../utils/config/config"));
class Cli {
    static Run() {
        return __awaiter(this, arguments, void 0, function* (args = []) {
            const [command, subcommand] = args;
            const cfg = config_1.default.load("./config/config.json");
            const log = new logger_1.Logger(cfg.server.logging.level);
            const db = new database_1.Database(cfg.database.sql);
            switch (`${command} ${subcommand || ''}`.trim()) {
                case 'migrate up':
                    log.info('Starting migrations: up');
                    yield db.up();
                    log.info('Migrations up completed.');
                    break;
                case 'migrate down':
                    log.info('Starting migrations: down');
                    yield db.down();
                    log.info('Migrations down completed.');
                    break;
                case 'service run': {
                    // TODO: запуск сервиса
                    yield new Promise(() => {
                        /* вечно «висим» до Ctrl+C */
                    });
                    return true;
                }
                default:
                    log.error(`Unknown command: ${args.join(' ')}`);
                    log.error(`Usage:
            \t node index.js service run \n
            \t node index.js migrate up \n
            \t node index.js migrate down \n`);
                    return false;
            }
            return true;
        });
    }
}
exports.default = Cli;
