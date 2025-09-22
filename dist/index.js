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
const node_process_1 = require("node:process");
const cli_1 = __importDefault(require("./cli/cli")); // расширение .ts не пишем — tsc подставит
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = node_process_1.argv.slice(2);
        const success = yield cli_1.default.Run(args);
        if (!success) {
            console.error('Failed to start backend. Exiting.');
            (0, node_process_1.exit)(1);
        }
    });
}
main().catch((err) => {
    var _a;
    if (err instanceof Error) {
        console.error('Unexpected error:', (_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
    }
    else {
        console.error('Unexpected error:', err);
    }
    (0, node_process_1.exit)(1);
});
