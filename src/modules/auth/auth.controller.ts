import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import log from "../../utils/logger";

import {
    DeleteAccountSchema,
    LoginSchema,
    RegisterDefaultSchema,
    RegisterSchemaByAdmin,
    ResetPassword,
} from "./auth.dto";
import AuthDomain from "./auth.domain";
import {loginResponse} from "./auth.response";

export default class AuthController {
    private domain: AuthDomain;

    constructor() {
        this.domain = new AuthDomain();
    }

    async register(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (req.body?.data?.type !== "register") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const candidate = {
            email: req.body.data.attributes.email,
            username: req.body.data.attributes.username,
            password: req.body.data.attributes.password,
        }

        const parsed = RegisterDefaultSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in register", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.register(parsed.data);

            return res.status(201).json();
        } catch (err) {
            log.error("Error in register", { error: err });

            next(err);
        }
    }

    async registerByAdmin(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (req.body?.data?.type !== "register") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const candidate = {
            email: req.body.data.attributes.email,
            username: req.body.data.attributes.username,
            password: req.body.data.attributes.password,
            role: req.body.data.attributes.role,
        }

        const parsed = RegisterSchemaByAdmin.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in registerByAdmin", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.registerByAdmin(parsed.data);

            return res.status(201).json({ message: "Admin registered successfully" });
        } catch (err) {
            log.error("Error in registerByAdmin", { error: err });

            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (req.body?.data?.type !== "login") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const candidate = {
            username: req.body.data.attributes.username,
            email: req.body.data.attributes.email,
            password: req.body.data.attributes.password,
        }

        const parsed = LoginSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in login", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const result = await this.domain.login(parsed.data);

            return res.status(200).json(
                loginResponse(result)
            );
        } catch (err) {
            log.error("Error in login", { error: err });

            next(err);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (req.body?.data?.type !== "reset_password") {
            return res.status(400).json({ message: "Invalid type" });
        }

        const candidate = {
            userId: req.user.id,
            newPassword: req.body.data.attributes.new_password,
        }

        const parsed = ResetPassword.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in resetPassword", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.resetPassword(parsed.data);

            return res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            log.error("Error in resetPassword", { error: err });

            next(err);
        }
    }

    async deleteAccount(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const candidate = {
            user_id: req.user.id,
        }

        const parsed = DeleteAccountSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in deleteAccount", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.deleteUser(parsed.data);

            return res.status(200).json({ message: "Account deleted successfully" });
        } catch (err) {
            log.error("Error in deleteAccount", { error: err });

            next(err);
        }
    }
}
