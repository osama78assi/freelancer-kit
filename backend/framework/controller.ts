import { Router, RouterOptions, static as static_ } from "express";
import { SingletonStorage } from "./types";

// Implementing Singleton object desgin pattern

export type ControllerBuilder = {
    new (): Controller;
    getInstance<T extends Controller>(
        this: new () => T,
        routerOptions?: RouterOptions,
    ): T;
};

const singletonStorage: SingletonStorage = {};

export default abstract class Controller {
    // Each controller should have a routes
    protected routes!: Router;
    constructor() {}

    public static getInstance<T extends Controller>(
        this: new () => T,
        routerOptions?: RouterOptions,
    ): T {
        // Create an instance of controller if not exists
        const controllerName = this.name;
        if (singletonStorage[controllerName]) {
            return singletonStorage[controllerName] as T;
        }
        singletonStorage[controllerName] = new this();

        // Call the init
        (singletonStorage[controllerName] as T).init(routerOptions);

        return singletonStorage[controllerName] as T;
    }

    // All the heavy logic goes here
    protected init(routerOptions?: RouterOptions) {
        this.routes = Router(routerOptions);

        // Init the router
        this.initRouter();
    }

    // Each controller should expose that routes for the public
    public getRouter(): Router {
        return this.routes;
    }

    // In case you want to set a parent path
    protected setParentPath(path: string) {
        const newRouter = Router();
        newRouter.use(path, this.routes);
        this.routes = newRouter;
    }

    // Each class shoult initialize his routes
    protected abstract initRouter(): void;

    // To create a static handlers
    protected initStatics(pathToStatic: string, route: string = "/static") {
        if (pathToStatic) {
            this.routes.use(route, static_(pathToStatic));
        }
    }

    // To register the views for static files
    public getStaticViews(): string[] {
        return [];
    }
}
