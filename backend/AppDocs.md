### Express Web Application With Typescript
this is a very simple but robust framework, the `application` is totally separated from the `server` where the server is living at `index.ts` while the main web application is living at `app.ts` and it can be any file really

the framework is all about `OOP` and eliminating the free code style of javascript. The flow is simple and the file structure is simple and powerfull and the same time

### File Structure
the root of the application you can have your `lib, util, middlewares, prisma` and any custom folders like also `services`


**Note:** that `services` here means global services like `email service` or anything that any part of the application can interact with it very smoothly

**Modules:** is the most important folder it contains the application module. Think of a module as a standalone feature that have multiple `controllers`, `services`, `types` and more you can have anything you want in this place

1. Create the folder with the name of the feature or module `auth, orders`
2. Create 2 main folders `controllers` and `services` where each one you can create a controller and a service
3. For services follow this pattern to let you know later what did you imported `FEATURE.service.ts` or `FEATURE.controller`
4. If you are using `Sequelize` instead of prisma then add your models for the specific module in its folder and name it `models` and for prisma have a module specific models file

**The Most Important Rules:**

1. Don't communicate with different application `models` directly, you must pass through the `service` layer
2. Don't handle `business logic` in the controller layer
3. When you define a controller then extend from the `Controller` abstract class
4. When you define a service then extend from the `Service` class


### How to define an app ?
for simplicity you will make only one app. Of course you can create multiple applications and connect them but that will require you to change the code. Anyway create a class and inherite from the `ExpressApp`abstract class it's exist in `./util/expressApp.ts` and you will get some functions

1. It's importand to override error handler and that to let you plugin your custome `error handler middleware` more on that later
2. You need to override the `init` method and here where your logic will be from `registering controllers` to add different third party middlewares like `cors` or `cookie-parser`
3. Finally override the `start` method to make the `server` able to start your application and also here 

```js

class App extends ExpressApp {
    public constructor() {
        super({ appName: "TornadoLearning", port: 3000 });
    }

    protected override setErrorHandler(): void {
        this.errorHandler = new AppErrorHandler();
    }

    public override async init() {
        // Run the middlewares

        // Cookie parser
        this.app.use(cookieParser());

        // JSON
        this.app.use(express.json({ limit: "10mb" }));

        // Use the controllers
        this.registerController({ Builder: AuthController });

        // Add a register to take the request in case not found
        this.app.use(
            "/{*anyPath}",
            (req: Request, res: Response, next: NextFunction) => {
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

    public async start() {
        this.app.listen(port, () => {
            console.log(
                `Application ${this.name} started and listenning in port ${port}`,
            );
        });
    }
}
```

### Handle The Errors
hanlding errors is pretty simple as you will separate any `API related errors` from the application errors, for example you can encapsulate `Zod errors` later by implementing onError

```js

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
        res.status(500).json({
            error,
        });
    }

    protected onProductionError(
        error: Error,
        req: Request,
        res: Response,
        next: NextFunction,
    ): void {
        // You can customize the errors here and specify different code and response
        res.status(500).json({
            code: "INTERNAL_SERVER_ERROR",
            message: "Internal server error",
        });
    }
}
```

### Run the server
the server is pretty simple, it's where you put the database connection, configurations and many different things. Usually it's the `index.ts` where it sets in the root of your folder

```js
import App from "./app.js";
import DotEnv from "./util/dotenv.js";

class Main {
    public static async main(): Promise<void> {
        // Read the dot env, This class help you also extract the variables from the dotenv files
        DotEnv.readDotEnv();

        // Take instance of your application (or multiple applications)
        const mainApp = new App();

        // Initialize it
        await mainApp.init();

        // Start it
        await mainApp.start();

        // Handle unhandled promise rejection
        process.on("unhandledRejection", function (err) {
            console.log(err);
        });

        process.on("uncaughtException", function (err) {
            console.log(err);
        });
    }
}

// Call the main entry
Main.main();

```