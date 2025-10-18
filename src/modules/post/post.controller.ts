import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {log} from "../../utils/logger/logger";
import {PostDomain} from "./post.domain";
import {MustRequestBody} from "../../api/decorators/request_body";
import {
    UpdatePostStatusSchema,
    CreatePostSchema, DeleteLikePostSchema,
    DeletePostSchema,
    GetPostSchema,
    LikePostSchema,
    ListLikesPostsSchema,
    ListPostsSchema,
    UpdatePostSchema,
} from "./post.dto";

class PostController {
    private domain: PostDomain;

    constructor() {
        this.domain = new PostDomain();
    }

    @MustRequestBody()
    async createPost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            author_id:  req.user?.id,
            title:      req.body?.title,
            content:    req.body?.content,
            categories: req.body?.categories,
        };

        const parsed = CreatePostSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in createPost", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.createPost(parsed.data);

            return res.status(201).json({
                post: post,
            });
        } catch (err) {
            log.error("Error in createPost", { error: err });

            next(err);
        }
    }

    async getPost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.user?.id,
            post_id: req.params?.post_id,
        }

        const parsed = GetPostSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in getPost", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.getPost(parsed.data);

            return res.status(200).json(post);
        } catch (err) {
            log.error("Error in getPost", { error: err });

            next(err);
        }
    }

    async listPosts(req: Request, res: Response, next: NextFunction) {
        log.info("ListPosts req.query ", req.query);

        const candidate = {
            user_id:         req.query?.user_id,
            status:          req.query?.status,
            title:           req.query?.title,
            category_id:     req.query?.category_id,
            order_by:        req.query?.order_by,
            order_dir:       req.query?.order_dir,
            offset:          req.query?.offset,
            limit:           req.query?.limit,
        }

        const parsed = ListPostsSchema.safeParse(candidate);
        if (!parsed.success) {
            // log.error("Validation error in listPosts", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const posts = await this.domain.listPosts(parsed.data);

            // log.info("ListPosts posts ", posts);

            return res.status(200).json(posts);
        } catch (err) {
            log.error("Error in listPosts", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async updatePost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            post_id:      req.params?.post_id,
            initiator_id: req.user?.id,
            title:        req.body?.title,
            content:      req.body?.content,
            categories:   req.body?.categories,
        }

        const parsed = UpdatePostSchema.safeParse(candidate);

        if (!parsed.success) {
            log.error("Validation error in updatePost", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.updatePost(parsed.data);

            console.log("Updated post ", post.data);
            return res.status(200).json(post);
        } catch (err) {
            log.error("Error in updatePost", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async updatePostStatus(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id:   req.user?.id,
            initiator_role: req.user?.role,
            post_id:        req.params?.post_id,
            status:         req.body?.status,
        }

        const parsed = UpdatePostStatusSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updatePostStatus", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.getPost(parsed.data);
            if (post.data.author_id !== candidate.initiator_id && candidate.initiator_role !== 'admin') {
                return res.status(403).json({ message: "Only the author or admin can change the post status" });
            }

            const update = await this.domain.updatePostStatus(parsed.data);

            return res.status(200).json(update);
        } catch (err) {
            log.error("Error in updatePostStatus", { error: err });

            next(err);
        }
    }

    async deletePost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id:      req.params?.post_id,
        }

        const parsed = DeletePostSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in deletePost", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.deletePost(parsed.data);

            return res.status(204).send();
        } catch (err) {
            log.error("Error in deletePost", { error: err });

            next(err);
        }
    }

    async like(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id:      req.params?.post_id,
            type:         req.body?.type,
        }

        const parsed = LikePostSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in like", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.likePost(parsed.data);
            return res.status(200).json(post);
        } catch (err) {
            log.error("Error in like", { error: err });

            next(err);
        }
    }

    async deleteLike(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id:      req.params?.post_id,
        }

        const parsed = DeleteLikePostSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in like", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.deleteLike(parsed.data);
            return res.status(200).json(post);
        } catch (err) {
            log.error("Error in like", { error: err });

            next(err);
        }
    }

    async listLikes(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            post_id: req.params?.post_id,
            offset:  req.query?.offset,
            limit:   req.query?.limit,
        }

        const parsed = ListLikesPostsSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in ListLikes", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const likes = await this.domain.listLikesPosts(parsed.data);

            return res.status(200).json(likes);
        } catch (err) {
            log.error("Error in ListLikes", { error: err });

            next(err);
        }
    }
}

export const postController = new PostController();