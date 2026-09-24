### Singleton Design Pattern
The class can have one and only one instance, that will align perfectly with the controller as the app will manage that object
and the system can have only one controller instance, this also applied for service as only one service instance is allowed

### Want to add custom logic ?
make sure to override the method init
```js
class AuthController extends Controller {
    protected override init() {
        // Do something with the object
        
        // Call the super init method
        super.init();
    }
}
```
### Want to add routes ?
make sure to implements the method `initRouter` and access the routes at that level

```js
class AuthController extends Controller {
    initRouter(): void {
        this.routes.post("/auth/login", this.login);
        this.routes.post("/auth/signup", this.signup);
        this.routes.get("/auth/me", this.getMe);
    }
}
```

in case you don't want to rewrite the path twice then use `setParentPath` method. Make sure to call it after you finish the routes you need that `parent path` to be added to them as a prefix, because if you added any route after that function call will not take that path. And when you call that `setParentPath` it will wrap all the previous routes to the position of the route matter here

```js
class AuthController extends Controller {
    initRouter(): void {
        // All of the following three paths will be
        this.routes.post("/login", this.login); // /auth/login
        this.routes.post("/signup", this.signup); // /auth/signup
        this.routes.get("/me", this.getMe);// /auth/me

        // Note that this will set this prefix for all previous routes
        this.setParentPath("/auth");

        this.routes.get("/reset-password", this.resetPassword); // Warning: this will not be "/auth/reset-password"
    }
}
```

### Add some endpoints
it's strightforward and simple

```js
class AuthController extends Controller {
    private async login(
        req: Request,
        res: Response,
        next: NextFunction,
    ): Promise<any> {
        // Do the logic
    }
}

```