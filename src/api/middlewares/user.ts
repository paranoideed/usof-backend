import type {NextFunction, Request, Response} from "express";
import {ForbiddenError} from "../errors";

export function userOnlyMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!req.user || req.user.role !== "user") {
        return next(new ForbiddenError("User access required"));
    }
    next();
}
