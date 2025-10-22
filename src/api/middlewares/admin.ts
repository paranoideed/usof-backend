import type {NextFunction, Request, Response} from "express";

import {ForbiddenError} from "../errors";

export default function adminOnlyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user || req.user.role !== "admin") {
        return next(new ForbiddenError("Admin access required"));
    }
    next();
}
