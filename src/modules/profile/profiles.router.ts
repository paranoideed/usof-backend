import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import { profileController } from "./profile.controller";
import {authMiddleware} from "../../api/middlewares/auth";

const profileRouter = express.Router();

profileRouter.get(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.getOwnProfile(req, res, next);
    }
);

profileRouter.get(
    "/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.getProfile(req, res, next);
    }
);

profileRouter.get(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.listUsers(req, res, next);
    }
);

export { profileRouter };