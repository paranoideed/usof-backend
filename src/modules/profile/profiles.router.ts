import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import ProfileController from "./profile.controller";
import authMiddleware from "../../api/middlewares/auth";
import uploadAvatarMiddleware from "../../api/middlewares/avatar";

const profileRouter = express.Router();
const profileController = new ProfileController();

profileRouter.get(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.getOwnProfile(req, res, next);
    }
);

profileRouter.post(
    "/me",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.updateProfile(req, res, next);
    }
);

profileRouter.post(
    "/me/avatar",
    authMiddleware,
    uploadAvatarMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.uploadAvatar(req, res, next);
    }
);

profileRouter.get(
    "/id/:user_id",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.getProfile(req, res, next);
    }
);

profileRouter.get(
    "/username/:username",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.getProfile(req, res, next);
    }
);

profileRouter.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<Response | void>  => {
        await profileController.listUsers(req, res, next);
    }
);

export default profileRouter;