import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import log from "../../utils/logger";

import {
    GetProfileSchema,
    ListProfilesSchema, UpdateAvatarSchema,
    UpdateProfileSchema,
} from "./profile.dto";
import ProfileDomain from "./profile.domain";
import {PayloadTooLarge, UnsupportedMediaType} from "../../api/errors";
import {profileListResponse, profileResponse} from "./profile.response";

export default class ProfileController {
    private domain: ProfileDomain;

    constructor() {
        this.domain = new ProfileDomain();
    }

    async getOwnProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

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

            return res.status(200).json(
                profileResponse(user)
            );
        } catch (err) {
            log.error("Error in getOwnProfile", { error: err });

            next(err);
        }
    }

    async getProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
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

            return res.status(200).json(
                profileResponse(user)
            );
        } catch (err) {
            log.error("Error in getProfile", { error: err });

            next(err);
        }
    }

    async listUsers(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const candidate = {
            username: req.query?.username,
            limit:    req.query?.limit ? parseInt(req.query.limit as string, 10) : undefined,
            offset:   req.query?.offset ? parseInt(req.query.offset as string, 10) : undefined,
        }

        const parsed = ListProfilesSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in listUsers", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const users = await this.domain.listProfiles(parsed.data);

            return res.status(200).json(
                profileListResponse(users)
            );
        } catch (err) {
            log.error("Error in listUsers", { error: err });

            next(err);
        }
    }

    async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.body?.data?.type !== "profile") {
            log.error("Invalid request type in updateProfile", { type: req.body?.data?.type });
            return res.status(400).json({ message: "Invalid request type" });
        }

        if (req.user?.id !== req.body?.data?.id) {
            log.error("Forbidden updateProfile attempt", { user_id: req.user?.id, body_id: req.body?.data?.id });
            return res.status(403).json({ message: "Forbidden" });
        }

        const candidate = {
            user_id:   req.user.id,
            username:  req.body?.data?.attributes?.username,
            pseudonym: req.body?.data?.attributes?.pseudonym,
        }

        const parsed = UpdateProfileSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in updateProfile", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const user = await this.domain.updateProfile(parsed.data);

            return res.status(200).json(
                profileResponse(user)
            );
        } catch (err) {
            log.error("Error in updateProfile", { error: err });

            next(err);
        }
    }

    async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const parsed = UpdateAvatarSchema.safeParse({
            user_id: req.user.id,
            avatar:  req.file,
        });
        if (!parsed.success) {
            log.error("Validation error in uploadAvatar", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        if (!["image/png", "image/jpeg", "image/gif"].includes(parsed.data.avatar.mimetype)) {
            log.error("Avatar upload failed: unsupported media type", {
                user_id: parsed.data.user_id,
                mimetype: parsed.data.avatar.mimetype,
            });

            throw new UnsupportedMediaType("Only image/png is allowed");
        }
        if (parsed.data.avatar.size > 10 * 1024 * 1024) {
            log.error("Avatar upload failed: file too large", {
                user_id: parsed.data.user_id,
                size: parsed.data.avatar.size,
            });

            throw new PayloadTooLarge("File too large: max 10MB");
        }

        try {
            const user = await this.domain.updateAvatar(parsed.data);

            return res.status(200).json(
                profileResponse(user)
            );
        } catch (err: any) {
            log.error("Error in uploadAvatar", { error: err });

            next(err);
        }
    }
}