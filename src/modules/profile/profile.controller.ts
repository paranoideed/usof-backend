import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import log from "../../utils/logger";

import {
    GetProfileSchema,
    GetProfilesSchema, UpdateAvatarSchema,
    UpdateProfileSchema,
} from "./profile.dto";
import ProfileDomain from "./profile.domain";
import {putUserAvatarPNG} from "../../stprage/s3";

export default class ProfileController {
    private domain: ProfileDomain;

    constructor() {
        this.domain = new ProfileDomain();
    }

    async getOwnProfile(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id: req.user?.id,
        }

        const parsed = GetProfileSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in getOwnProfile", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.getProfile(parsed.data);

            return res.status(200).json(user);
        } catch (err) {
            log.error("Error in getOwnProfile", { error: err });

            next(err);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id:  req.params?.user_id,
            username: req.params?.username,
        }

        const parsed = GetProfileSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in getProfile", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.getProfile(parsed.data);

            return res.status(200).json(user);
        } catch (err) {
            log.error("Error in getProfile", { error: err });

            next(err);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            username: req.query?.username,
            limit:    req.query?.limit ? parseInt(req.query.limit as string, 10) : undefined,
            offset:   req.query?.offset ? parseInt(req.query.offset as string, 10) : undefined,
        }

        const parsed = GetProfilesSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in listUsers", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const users = await this.domain.listProfiles(parsed.data);

            return res.status(200).json(users);
        } catch (err) {
            log.error("Error in listUsers", { error: err });

            next(err);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const candidate = {
            user_id:   req.user.id,
            username:  req.body?.username,
            pseudonym: req.body?.pseudonym,
        }

        const parsed = UpdateProfileSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updateProfile", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.updateProfile(parsed.data);

            return res.status(200).json(user);
        } catch (err) {
            log.error("Error in updateProfile", { error: err });

            next(err);
        }
    }

    async uploadAvatar(req: Request, res: Response, next: NextFunction) {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const candidate = {
            user_id: req.user.id,
            avatar:  req.file,
        }

        const parsed = UpdateAvatarSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in uploadAvatar", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const file = (req as any).file as { mimetype: string; size: number; buffer: Buffer } | undefined;
            if (!file) {
                return res.status(400).json({ message: "File 'avatar' is required" });
            }

            if (file.mimetype !== "image/png") {
                return res.status(415).json({ message: "Only PNG is allowed" });
            }
            if (file.size > 10 * 1024 * 1024) {
                return res.status(413).json({ message: "Max size is 10MB" });
            }

            const user = await this.domain.updateAvatar(parsed.data);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            const { url, key } = await putUserAvatarPNG(String(req.user.id), file.buffer);
            const bustUrl = `${url}?v=${Date.now()}`;

            return res.status(200).json({ ok: true, key, url: bustUrl });
        } catch (err: any) {
            log.error("Error in uploadAvatar", { error: err });

            if (err?.message?.includes("File too large")) {
                return res.status(413).json({ message: "Max size is 10MB" });
            }
            if (err?.message?.includes("Only image/png")) {
                return res.status(415).json({ message: "Only PNG is allowed" });
            }
            next(err);
        }
    }
}