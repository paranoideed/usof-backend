import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import { categoryController } from "./category.controller.js";
import {authMiddleware} from "../../api/middlewares/auth";
import {adminOnlyMiddleware} from "../../api/middlewares/admin";

const categoryRouter = express.Router();

categoryRouter.get(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        await categoryController.listCategories(req, res, next);
    }
);

categoryRouter.get(
    "/:category_id",
    async (req: Request, res: Response, next: NextFunction) => {
        await categoryController.getCategory(req, res, next);
    }
);

categoryRouter.post(
    "/",
    authMiddleware,
    adminOnlyMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await categoryController.createCategory(req, res, next);
    }
);

categoryRouter.patch(
    "/:category_id",
    authMiddleware,
    adminOnlyMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await categoryController.updateCategory(req, res, next);
    }
);

categoryRouter.delete(
    "/:category_id",
    authMiddleware,
    adminOnlyMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await categoryController.deleteCategory(req, res, next);
    }
);

export { categoryRouter };