import express from "express";

import authRouter from "../modules/auth/auth.router.js";
import postRouter from "../modules/post/post.router.js";
import commentRouter from "../modules/comment/comment.router.js";
import categoryRouter from "../modules/category/category.router.js";
import profileRouter from "../modules/profile/profiles.router";

const apiRouter = express.Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/profiles", profileRouter);
apiRouter.use("/posts", postRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/comments", commentRouter);

export default apiRouter;