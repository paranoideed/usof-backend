import express from "express";
import { authRouter } from "../modules/auth/auth.router.js";
import { postRouter } from "../modules/post/post.router.js";
import { commentRouter } from "../modules/comment/comment.router.js";
import { categoryRouter } from "../modules/category/category.router.js";
import {profileRouter} from "../modules/profile/profiles.router";

const apiRouter = express.Router();

apiRouter.use("/api/v1/auth", authRouter);
apiRouter.use("/api/v1/profiles", profileRouter);
apiRouter.use("/api/v1/posts", postRouter);
apiRouter.use("/api/v1/categories", categoryRouter);
apiRouter.use("/api/v1/comments", commentRouter);

export { apiRouter };