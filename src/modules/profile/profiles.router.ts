import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import ProfileController from "./profile.controller";
import authMiddleware from "../../api/middlewares/auth";

const profileRouter = express.Router();
const profileController = new ProfileController();

profileRouter.get(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.getOwnProfile(req, res, next);
    }
);

profileRouter.post(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.updateProfile(req, res, next);
    }
);

profileRouter.get(
    "/id/:user_id",
    async (req: Request, res: Response, next: NextFunction) => {
        await profileController.getProfile(req, res, next);
    }
);

profileRouter.get(
    "/username/:username",
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

export default profileRouter;