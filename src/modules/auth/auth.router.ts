import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import { authController } from "./auth.controller.js";

const authRouter = express.Router();

authRouter.post(
    "/register",
    (req: Request, res: Response, next: NextFunction) =>
        authController.register(req, res, next)
);

authRouter.post(
    "admin/register",
    (req: Request, res: Response, next: NextFunction) =>
        authController.registerByAdmin(req, res, next)
);

authRouter.post(
    "/login",
    (req: Request, res: Response, next: NextFunction) =>
    authController.login(req, res, next)
);

authRouter.post(
    "/logout",
    (req: Request, res: Response, next: NextFunction) =>
    function (req: Request, res: Response, next: NextFunction) {
        // Placeholder for logout functionality, all operation logout on client side
        res.status(200).json({ message: "User logged out successfully" });
    }(req, res, next)
)

authRouter.post(
    "/reset-password",
    (req: Request, res: Response, next: NextFunction) =>
        authController.resetPassword(req, res, next)
);


export { authRouter };