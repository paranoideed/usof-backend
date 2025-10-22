import express from "express";

import config from "./utils/config";
import log from "./utils/logger";
import apiRouter from "./api/router";

import errorRenderer from "./api/middlewares/error";

export class App {
    public expressApp: express.Express;

    constructor(
        private readonly port = Number(config.server.port) // <-- привели к числу
    ) {
        this.port = config.server.port;
        this.expressApp = express();
        this.expressApp.use(express.json());
        this.expressApp.use(express.urlencoded({ extended: true }));
        this.expressApp.use("/api/v1", apiRouter);
        this.expressApp.use(errorRenderer);
    }

    async run() {
        return new Promise<void>((resolve) => {
            this.expressApp.listen(this.port, () => {
              log.info(`Server is running on port ${this.port}`);
                resolve();
            });
        });
    }
}

const app = new App();
export default app;