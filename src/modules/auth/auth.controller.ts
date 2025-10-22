import { z } from "zod";
import type { NextFunction, Request, Response } from "express";


import {log} from "../../utils/logger/logger";

import {AuthDomain} from "./auth.domain";
import {LoginSchema, RegisterSchema, ResetPassword} from "./auth.dto";


export class AuthController {
    private domain: AuthDomain;

    constructor() {
        this.domain = new AuthDomain();
    }

    
    async register(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            email:    req.body.email,
            username: req.body.username,
            password: req.body.password,
            role:     "user",
        };

        const parsed = RegisterSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in register", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.register(parsed.data);

            return res.status(201).json({ message: "User registered successfully" });
        } catch (err) {
            log.error("Error in register", { error: err });

            next(err);
        }
    }

    
    async registerByAdmin(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            email:    req.body.email,
            username: req.body.username,
            password: req.body.password,
            role:     req.body.role,
        };

        const parsed = RegisterSchema.safeParse(candidate);
        if (!parsed.success) {
            log.error("Validation error in registerByAdmin", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            await this.domain.register(parsed.data);

            return res.status(201).json({ message: "Admin registered successfully" });
        } catch (err) {
            log.error("Error in registerByAdmin", { error: err });

            next(err);
        }
    }

    
    async login(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            email:    req.body.email,
            username: req.body.username,
            password: req.body.password,
        };

        const parsed = LoginSchema.safeParse(req.body);
        if (!parsed.success) {
            log.error("Validation error in login", { errors: parsed.error });

            return res.status(400).json(z.treeifyError(parsed.error));
        }

        try {
            const result = await this.domain.login(parsed.data);

            return res.status(200).json(result);
        } catch (err) {
            log.error("Error in login", { error: err });

            next(err);
        }
    }

    
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        const candidate = {
            user_id:      req.user?.id,
            new_password: req.body.new_password,
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
}

export const authController = new AuthController();