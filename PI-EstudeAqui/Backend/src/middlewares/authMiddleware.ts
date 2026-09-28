import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors";
import { verifyToken } from "../utils/jwtUtil";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token

    if (!token) {
        throw new UnauthorizedError('Token não informado')
    }

    req.user = verifyToken(token)

    return next()
}