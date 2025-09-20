import express from "express";
import { authRouter } from "../app/modules/auth/auth.router.js";
import { userRouter } from "../app/modules/user/user.router.js";
import { postRouter } from "../app/modules/post/post.router.js";
import { commentRouter } from "../app/modules/comment/comment.router.js";
import { categoryRouter } from "../app/modules/category/category.router.js";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comment", commentRouter);

export { apiRouter };