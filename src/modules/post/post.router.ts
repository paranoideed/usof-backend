import express, {
    type NextFunction,
    type Request,
    type Response
} from "express";
import {postController} from "./post.controller";

const postRouter = express.Router();

postRouter.post(
    "/",
    async (req: Request, res: Response, next: NextFunction) => {
        await postController.createPost(req, res, next);
    }
);

postRouter.get(
    "/:post_id",
    async (req, res, next) => {
        await postController.getPost(req, res, next);
    }
);

postRouter.post(
    "/:post_id",
    async (req: Request, res: Response, next: NextFunction) => {
        await postController.updatePost(req, res, next);
    }
);

postRouter.delete(
    "/:post_id",
    async (req: Request, res: Response, next: NextFunction) => {
        await postController.deletePost(req, res, next);
    }
);

postRouter.post(
    "/:post_id/like",
    async (req: Request, res: Response, next: NextFunction) => {
        await postController.like(req, res, next);
    }
);

postRouter.get(
    "/:post_id/like",
    async (req: Request, res: Response, next: NextFunction) => {
        await postController.ListLikes(req, res, next);
    }
);

export { postRouter };