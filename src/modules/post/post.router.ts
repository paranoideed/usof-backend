import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import {postController} from "./post.controller";
import {authMiddleware} from "../../api/middlewares/auth";

const postRouter = express.Router();

postRouter.post(
    "/",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.createPost(req, res, next);
    }
);

postRouter.get(
    "/",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.listPosts(req, res, next);
    }
);

postRouter.get(
    "/:post_id",
    authMiddleware,
    async (req, res, next): Promise<void> => {
        await postController.getPost(req, res, next);
    }
);

postRouter.put(
    "/:post_id",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.updatePost(req, res, next);
    }
);

postRouter.delete(
    "/:post_id",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.deletePost(req, res, next);
    }
);

postRouter.post(
    "/:post_id/like",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.like(req, res, next);
    }
);

postRouter.patch(
    "/:post_id/status",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.updatePostStatus(req, res, next);
    }
);

postRouter.delete(
    "/:post_id/like",
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.deleteLike(req, res, next);
    }
);

postRouter.get(
    "/:post_id/like",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        await postController.listLikes(req, res, next);
    }
);

export { postRouter };