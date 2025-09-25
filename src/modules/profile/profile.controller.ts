import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {ProfileDomain} from "./profile.domain";
import {GetPostSchema, ListPostsSchema} from "../post/post.dto";
import {MustRequestBody} from "../../api/decorators/request_body";

class ProfileController {
    private domain: ProfileDomain;

    constructor() {
        this.domain = new ProfileDomain();
    }

    async getOwnProfile(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.user?.id,
        }

        const parsed = GetPostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.getProfile(candidate);
            if (!user) {
                return res.status(401).json({ message: "User not found" });
            }
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.params?.user_id,
        }

        const parsed = GetPostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.getProfile(candidate);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.query?.user_id,
            username: req.query?.username,
            email: req.query?.email,
            limit: req.query?.limit ? parseInt(req.query.limit as string, 10) : undefined,
            offset: req.query?.offset ? parseInt(req.query.offset as string, 10) : undefined,
        }

        const parsed = ListPostsSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const users = await this.domain.listProfiles(parsed.data);
            return res.status(200).json(users);
        } catch (err) {
            next(err);
        }
    }

    @MustRequestBody()
    async updateProfile(req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const candidate = {
            user_id: req.user.id,
            username: req.body?.username,
            pseudonym: req.body?.pseudonym,
            avatar: req.body?.avatar,
        }

        const parsed = GetPostSchema.safeParse(candidate);
        if (!parsed.success) {
            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.updateProfile(candidate);
            return res.status(200).json(user);
        } catch (err) {
            next(err);
        }
    }
}

export const profileController = new ProfileController();