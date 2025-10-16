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
import {log} from "../../utils/logger/logger";

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
            log.error("Validation error in createComment", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.createComment(req.body);

            return res.status(201).json(comment);
        }
        catch (err) {
            log.error("Error in createComment", { error: err });

            next(err);
        }
    }

    async getComment(req: Request, res: Response, next: NextFunction) {
        const parsed = GetCommentSchema.safeParse(req.params);
        if (!parsed.success) {
            log.error("Validation error in getComment", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.getComment(parsed.data);

            return res.status(200).json(comment);
        }
        catch (err) {
            log.error("Error in getComment", { error: err });

            next(err);
        }
    }

    async listComments(req: Request, res: Response, next: NextFunction) {
        const parsed = ListCommentsSchema.safeParse(req.query);
        if (!parsed.success) {
            log.error("Validation error in listComments", { errors: parsed.error });

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
            log.error("Error in listComments", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async updateComment(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id: req.params.comment_id,
            author_id:  req.user?.id,
            content:    req.body?.content,
        };

        const parsed = UpdateCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updateComment", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const comment = await this.domain.updateComment(parsed.data);

            return res.status(200).json(comment);
        }
        catch (err) {
            log.error("Error in updateComment", { error: err });

            next(err);
        }
    }

    async deleteComment(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id: req.params.comment_id,
            author_id:  req.user?.id,
        };

        const parsed = DeleteCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in deleteComment", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }
        try {
            await this.domain.deleteComment(parsed.data);

            return res.status(204).send();
        }
        catch (err) {
            log.error("Error in deleteComment", { error: err });

            next(err);
        }
    }

    async like(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            author_id:  req.user?.id,
            comment_id: req.params?.comment_id,
            type:       req.body?.type,
        }

        const parsed = LikeCommentSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in likeComment", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const post = await this.domain.likeComment(parsed.data);

            return res.status(200).json(post);
        } catch (err) {
            log.error("Error in likeComment", { error: err });

            next(err);
        }
    }

    async ListLikes(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            comment_id: req.params?.comment_id,
            author_id:  req.query?.user_id,
            type:       req.query?.type,

            limit:      req.query?.limit,
            offset:     req.query?.offset,
        }

        const parsed = ListCommentLikesSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in listCommentLikes", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const likes = await this.domain.listCommentLikes(parsed.data);

            return res.status(200).json(likes);
        } catch (err) {
            log.error("Error in listCommentLikes", { error: err });

            next(err);
        }
    }
}

export const commentController = new CommentController();