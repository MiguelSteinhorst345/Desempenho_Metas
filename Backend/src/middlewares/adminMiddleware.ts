import { NextFunction, Request, Response } from "express";
import { ForbiddenError } from "../errors";

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user
    
    if (user.role !== 'admin') {
        throw new ForbiddenError('Acesso Negado')
    }

    return next()
}