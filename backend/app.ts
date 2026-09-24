import cookieParser from "cookie-parser";
import express, {
    NextFunction,
    type Express,
    type Request,
    type Response,
} from "express";
import cors from "cors";
import DotEnv from "./framework/util/dotenv";
import APIError from "./framework/APIError";
import AppErrorHandler from "./middlewares/appErrorHandler";

import ExpressApp from "./framework/expressApp";
import { FreelanceServiceController } from "./modules/freelanceservice/controllers/freelanceService.controller";
import { RootController } from "./modules/root/controller/root.controller";

class App extends ExpressApp {
    public constructor() {
        super({ appName: "TrackingJobs", port: Number(DotEnv.getEnv("PORT")) });
    }

    protected override setErrorHandler(): void {
        this.errorHandler = new AppErrorHandler();
    }

    public override async init() {
        // Run the middlewares
        this.app.use(
            cors({
                origin: (origin, cb) => {
                    // Allow postman
                    if (
                        !origin &&
                        (DotEnv.getEnv("NODE_ENV") as string).toLowerCase() ===
                            "development"
                    ) {
                        return cb(null, true);
                    }

                    // Get the origins
                    const envOrigins = DotEnv.getEnv(
                        "CROS_ALLOWED_ORIGINS",
                    ) as string;

                    const allowed = envOrigins
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean)
                        .some((o) => o === origin);

                    if (allowed) {
                        return cb(null, true);
                    }
                    return cb(new Error("CORS not allowed"));
                },
            }),
        );

        // Cookie parser
        this.app.use(cookieParser());

        // JSON
        this.app.use(express.json({ limit: "10mb" }));

        // Set the view engine
        this.app.set("view engine", "ejs");

        // Use the controllers
        this.registerControllers([FreelanceServiceController, RootController]);

        // Add a register to take the request in case not found
        this.app.use(
            "/{*anyPath}",
            (req: Request, res: Response, next: NextFunction) => {
                console.log('##############');
                console.log(req.url)
                console.log('##############');
                
                return next(
                    new APIError({
                        code: "ROUTE_NOT_FOUND",
                        statusCode: 404,
                        message: "Endpoint isn't found",
                    }),
                );
            },
        );

        // Use the error handler
        this.app.use(this.errorHandler.hanlder.bind(this.errorHandler));
    }

    public override async start() {
        this.app.listen(this.port, () => {
            console.log(
                `Application ${this.appName} started and listenning at port ${this.port}`,
            );
        });
    }
}

export default App;
