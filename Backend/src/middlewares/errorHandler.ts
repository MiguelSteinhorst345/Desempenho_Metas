import { NextFunction, Request, Response } from "express";
import { AppError } from "../errors";
import { ZodError } from "zod";

export function errorHandler(error: Error, _req: Request, res: Response, _next: NextFunction) {

    if (error instanceof AppError) {
        return res.status(error.statusCode).json({
            success: false,
            message: error.message
        });
    }

    if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};

        error.issues.forEach(issue => {
            const field = issue.path.join('.');
            if (!errors[field]) {
                errors[field] = [];
            }
            errors[field].push(issue.message);
        });

        return res.status(400).json({
            success: false,
            message: 'Erro de Validação',
            errors
        });
    }

    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
    
}