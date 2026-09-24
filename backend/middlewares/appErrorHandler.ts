import { ZodError } from "zod";
import APIError from "../framework/APIError";
import ErorrHandler from "../framework/errorHandler";
import { Request, Response, NextFunction } from "express";

export default class AppErrorHandler extends ErorrHandler {
    protected onAPIError(
        error: APIError,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        res.status(error.statusCode).json({
            message: error.message,
            code: error.code,
            ...(error.extra === undefined ? {} : error.extra),
        });
    }

    protected onDevelopementError(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        if (error instanceof ZodError) {
            return this.onZodError(res, error);
        }

        // You can customize the errors here
        res.status(500).json(error);
    }

    protected onProductionError(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
        });
    }

    private onZodError(res: Response, error: ZodError) {
        res.status(400).json({
            code: "BAD_INPUT",
            message: error.issues.map((issue) => ({
                code: issue.code,
                message: issue.message,
                path: issue.path,
            })),
        });
    }
}
