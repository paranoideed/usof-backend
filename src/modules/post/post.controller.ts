import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {PostDomain} from "./post.domain";
import {MustRequestBody} from "../../api/decorators/request_body";
import {
    CreatePostSchema,
    DeletePostSchema,
    LikePostSchema,
    ListLikesPostsSchema,
    ListPostsSchema,
    UpdatePostSchema
} from "./post.dto";

class PostController {
    private domain: PostDomain;

    constructor() {
        this.domain = new PostDomain();
    }

    @MustRequestBody()
    async createPost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            author_id: req.user?.id,
            title: req.body?.title,
            content: req.body?.content,
            category: req.body?.category,
        };

        const parsed = CreatePostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.createPost(parsed.data);
            return res.status(201).json(post);
        } catch (err) {
            next(err);
        }
    }

    async getPost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            post_id: req.params?.post_id,
        }

        const parsed = z.object({ post_id: z.string().uuid() }).safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.getPost(parsed.data);
            if (!post) {
                return res.status(404).json({ message: "Post not found" });
            }
            return res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    }

    async listPosts(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.query?.user_id,
            status: req.query?.status,
            title: req.query?.title,
            offset: req.query?.offset,
            limit: req.query?.limit,
        }

        const parsed = ListPostsSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const posts = await this.domain.listPosts(parsed.data);
            return res.status(200).json(posts);
        } catch (err) {
            next(err);
        }
    }

    @MustRequestBody()
    async updatePost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id: req.params?.post_id,
            title: req.body?.title,
            content: req.body?.content,
            categories: req.body?.categories,
        }

        const parsed = UpdatePostSchema.safeParse(candidate);

        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.updatePost(parsed.data);
            return res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    }

    async deletePost(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id: req.params?.post_id,
        }

        const parsed = DeletePostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.deletePost(parsed.data);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async like(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            post_id: req.params?.post_id,
            type: req.body?.type,
        }

        const parsed = LikePostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.likePost(parsed.data);
            return res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    }

    async ListLikes(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            post_id: req.params?.post_id,
            offset: req.query?.offset,
            limit: req.query?.limit,
        }

        const parsed = ListLikesPostsSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const likes = await this.domain.listLikesPosts(parsed.data);
            return res.status(200).json(likes);
        } catch (err) {
            next(err);
        }
    }
}

export const postController = new PostController();