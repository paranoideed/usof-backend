import express from "express";
import { authRouter } from "../entities/auth/auth.router.js";
import { userRouter } from "../entities/user/user.router.js";
import { postRouter } from "../entities/post/post.router.js";
import { commentRouter } from "../entities/comment/comment.router.js";
import { categoryRouter } from "../entities/category/category.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comments", commentRouter);

export { apiRouter };