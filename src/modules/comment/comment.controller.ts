import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {CommentDomain} from "./comment.domain";
import {MustRequestBody} from "../../api/decorators/request_body";
import {
    CreateCommentSchema,
    DeleteCommentSchema,
    GetCommentSchema, LikeCommentSchema, ListCommentLikesSchema,
    ListCommentsSchema,
    UpdateCommentSchema
} from "./comment.dto";

class CommentController {
    private domain: CommentDomain;

    constructor() {
        this.domain = new CommentDomain();
    }

    @MustRequestBody()
    async createComment(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            author_id:  req.user?.id,
            post_id:    req.body?.post_id,
            content:    req.body?.content,
            parent_id:  req.body?.parent_id,
        };

        const parsed = CreateCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.createComment(req.body);

            return res.status(201).json(comment);
        }
        catch (err) {
            next(err);
        }
    }

    async getComment(req: Request, res: Response, next: NextFunction) {
        const parsed = GetCommentSchema.safeParse(req.params);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.getComment(parsed.data);
            if (!comment) {
                return res.status(404).json({ message: "Comment not found" });
            }

            return res.status(200).json(comment);
        }
        catch (err) {
            next(err);
        }
    }

    async listComments(req: Request, res: Response, next: NextFunction) {
        const parsed = ListCommentsSchema.safeParse(req.query);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comments = await this.domain.listComments(parsed.data);
            if (!comments) {
                return res.status(404).json({ message: "No comments found" });
            }

            return res.status(200).json({
                data: comments.data,
                total: comments.pagination.total,
                limit: comments.pagination.limit,
                offset: comments.pagination.offset
            });
        }
        catch (err) {
            next(err);
        }
    }

    @MustRequestBody()
    async updateComment(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id:   req.params.comment_id,
            initiator_id: req.user?.id,
            content:      req.body?.content,
        };

        const parsed = UpdateCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.updateComment(parsed.data);
            return res.status(200).json(comment);
        }
        catch (err) {
            next(err);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id:   req.params.comment_id,
            initiator_id: req.user?.id,
        };

        const parsed = DeleteCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }
        try {
            await this.domain.deleteComment(parsed.data);
            return res.status(204).send();
        }
        catch (err) {
            next(err);
        }
    }

    async like(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            initiator_id: req.user?.id,
            comment_id:   req.params?.comment_id,
            type: req.body?.type,
        }

        const parsed = LikeCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.likeComment(parsed.data);
            return res.status(200).json(post);
        } catch (err) {
            next(err);
        }
    }

    async ListLikes(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id: req.params?.comment_id,
            user_id:    req.query?.user_id,
            type:       req.query?.type,

            limit:      req.query?.limit,
            offset:     req.query?.offset,
        }

        const parsed = ListCommentLikesSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const likes = await this.domain.listCommentLikes(parsed.data);
            return res.status(200).json(likes);
        } catch (err) {
            next(err);
        }
    }
}

export const commentController = new CommentController();