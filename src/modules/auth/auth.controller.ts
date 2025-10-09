import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

import {MustRequestBody} from "../../api/decorators/request_body";
import {log} from "../../utils/logger/logger";

import {AuthDomain} from "./auth.domain";
import {LoginSchema, RegisterSchema, ResetPassword} from "./auth.dto";


export class AuthController {
    private domain: AuthDomain;

    constructor() {
        this.domain = new AuthDomain();
    }

    @MustRequestBody()
    async register(req: Request, res: Response, next: NextFunction) {
        req.body.role = "user";

        const parsed = RegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            log.error("Validation error in register", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.register(req.body);

            return res.status(201).json({ message: "User registered successfully" });
        } catch (err) {
            log.error("Error in register", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async registerByAdmin(req: Request, res: Response, next: NextFunction) {
        const parsed = RegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            log.error("Validation error in registerByAdmin", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.register(req.body);

            return res.status(201).json({ message: "Admin registered successfully" });
        } catch (err) {
            log.error("Error in registerByAdmin", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async login(req: Request, res: Response, next: NextFunction) {
        const parsed = LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            log.error("Validation error in login", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const result = await this.domain.login(req.body);

            return res.status(200).json(result);
        } catch (err) {
            log.error("Error in login", { error: err });

            next(err);
        }
    }

    @MustRequestBody()
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        const parsed = ResetPassword.safeParse(req.body);
        if (!parsed.success) {
            log.error("Validation error in resetPassword", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.resetPassword(req.body);

            return res.status(200).json({ message: "Password reset successfully" });
        } catch (err) {
            log.error("Error in resetPassword", { error: err });

            next(err);
        }
    }
}

export const authController = new AuthController();