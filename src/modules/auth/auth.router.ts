import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";

import AuthController from "./auth.controller.js";
import authMiddleware from "../../api/middlewares/auth";

const authRouter = express.Router();
const authController = new AuthController();

authRouter.post(
    "/register",
    (req: Request, res: Response, next: NextFunction): Promise<Response | void>  =>
        authController.register(req, res, next)
);

authRouter.post(
    "/admin/register",
    (req: Request, res: Response, next: NextFunction): Promise<Response | void>  =>
        authController.registerByAdmin(req, res, next)
);

authRouter.post(
    "/login",
    (req: Request, res: Response, next: NextFunction): Promise<Response | void>  =>
    authController.login(req, res, next)
);

authRouter.post(
    "/logout",
    (req: Request, res: Response, next: NextFunction): Promise<Response | void>  =>
    function (req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        // Placeholder for logout functionality, all operation logout on client side
        res.status(200).json({ message: "User logged out successfully" });
    }(req, res, next)
)

authRouter.post(
    "/reset-password",
    authMiddleware,
    (req: Request, res: Response, next: NextFunction): Promise<Response | void>  =>
        authController.resetPassword(req, res, next)
);

export default authRouter;