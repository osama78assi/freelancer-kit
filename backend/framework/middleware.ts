import { NextFunction, Request, Response } from "express";
import { SingletonStorage } from "./types";

const singletonStorage: SingletonStorage = {};

export default abstract class Middleware {
    public static getInstance<T extends Middleware>(this: new () => T): T {
        const serviceName = this.name;
        if (singletonStorage[serviceName]) {
            return singletonStorage[serviceName] as T;
        }

        singletonStorage[serviceName] = new this();

        // Call the init
        (singletonStorage[serviceName] as T).init();

        return singletonStorage[serviceName] as T;
    }

    public abstract init(): void;

    public abstract main(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<unknown>;
}
