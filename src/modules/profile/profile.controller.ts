import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {ProfileDomain} from "./profile.domain";

import {GetProfileSchema, GetProfilesSchema, UpdateProfileSchema} from "./profile.dto";
import {log} from "../../utils/logger/logger";

class ProfileController {
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
            avatar:    req.body?.avatar,
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
}

export const profileController = new ProfileController();