import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import CommentController from "./comment.controller.js";
import authMiddleware from "../../api/middlewares/auth";

const commentRouter = express.Router();
const commentController = new CommentController();

commentRouter.post(
    "/",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.createComment(req, res, next);
    }
);

commentRouter.get(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.listComments(req, res, next);
    }
);

commentRouter.get(
    "/:comment_id",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.getComment(req, res, next);
    }
);

commentRouter.patch(
    "/:comment_id",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.updateComment(req, res, next);
    }
);

commentRouter.delete(
    "/:comment_id",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.deleteComment(req, res, next);
    }
);

commentRouter.post(
    "/:comment_id/like",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.like(req, res, next);
    }
);

commentRouter.delete(
    "/:comment_id/like",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.deleteLike(req, res, next);
    }
);

commentRouter.get(
    "/:comment_id/like",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction) => {
        await commentController.listComments(req, res, next);
    }
);

export default commentRouter;