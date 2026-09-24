import { NextFunction, Request, Response } from "express";
import APIError from "./APIError";
import DotEnv from "./util/dotenv";

export default abstract class ErorrHandler {
    public hanlder(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        console.log(error);
        if (error instanceof APIError) {
            return this.onAPIError(error, req, res, next);
        }

        if (
            (DotEnv.getEnv("NODE_ENV") as string).toLocaleLowerCase() ===
            "development"
        ) {
            this.onDevelopementError(error, req, res, next);
        } else {
            this.onProductionError(error, req, res, next);
        }
    }

    protected abstract onAPIError(
        error: APIError,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void;
    protected abstract onDevelopementError(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void;
    protected abstract onProductionError(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void;
}
