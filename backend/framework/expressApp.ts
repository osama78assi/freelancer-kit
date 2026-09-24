import express, { type Express } from "express";
import ErorrHandler from "./errorHandler";
import { ControllerBuilder } from "./controller";

export default abstract class ExpressApp {
    protected app!: Express;
    protected appName!: string;
    protected errorHandler!: ErorrHandler;
    protected port!: number;

    public constructor({ appName, port }: { appName: string; port: number }) {
        this.app = express();
        this.appName = appName;
        this.port = port;
        this.setErrorHandler();
    }

    // For registering controllers

    protected registerController({
        path,
        Builder,
    }: {
        path?: string;
        Builder: ControllerBuilder;
    }) {
        const controllerInstance = Builder.getInstance();

        if (typeof path === "string") {
            this.app.use(path, controllerInstance.getRouter());
        } else {
            this.app.use(controllerInstance.getRouter());
        }

        // Set the views of the controller
        const currentViews = this.app.get("views");

        this.app.set("views", [
            ...(Array.isArray(currentViews) ? currentViews : [currentViews]),
            ...controllerInstance.getStaticViews(),
        ]);
    }

    protected registerControllers(Controllers: ControllerBuilder[]) {
        for (let Builder of Controllers) {
            this.registerController({ Builder });
        }
    }

    // Must be implemented
    protected abstract setErrorHandler(): void;

    // Here where you register your app and do many stuff
    public abstract init(): Promise<void>;

    // Should start the server
    public abstract start(): Promise<void>;
}
