# Static Files & Templates — How Controllers Serve Them

Each module can ship its own **static assets** and **view templates**. The base
`Controller` exposes two tools for that: `initStatics` (serve static files over
HTTP) and `getStaticViews` (register template/asset folders with Express).

The folder names **must** stay exactly `static` and `templates` — `build.js`
looks for those literal names to copy them into `dist/`.

---

## 1. Serving static files — `initStatics()`

```ts
protected initStatics(pathToStatic: string, route: string = "/static")
```

Register an Express static middleware on the controller's router:

- `pathToStatic` — absolute path to the folder whose files should be served.
- `route` — URL prefix under which those files are exposed (default `/static`).

Files placed in `pathToStatic` become publicly reachable, e.g.
`file.png` → `GET <parentPath>/static/file.png`.

### You MUST call it inside `initRouter()`

`initStatics` relies on `this.routes`, which only exists **after** `initRouter()`
setup begins. Call it from your `initRouter()` implementation:

```ts
class AuthController extends Controller {
    initRouter(): void {
        this.routes.post("/login", this.login);
        this.routes.post("/signup", this.signup);

        // Serve "./modules/auth/static" under "/static"
        this.initStatics(join(__dirname, "static"));
    }
}
```

> If the statics must live at a custom path, pass the second argument:
> `this.initStatics(join(__dirname, "static"), "/public")`.
> The `setParentPath` prefix is applied to it like any route.

### Overriding `initStatics`

If you override the method, call the parent implementation to keep the default
behavior:

```ts
protected override initStatics(pathToStatic: string, route = "/static") {
    super.initStatics(pathToStatic, route);
    // extra setup…
}
```

---

## 2. Registering template/asset folders — `getStaticViews()`

```ts
public getStaticViews(): string[]
```

The framework (`ExpressApp.registerController`) reads this and appends every
returned path to Express's `views` setting, so templates inside those folders can
be rendered.

Override it to hand back the folders you want registered:

```ts
class AuthController extends Controller {
    public override getStaticViews(): string[] {
        return [
            join(__dirname, "templates"),
            join(__dirname, "static"),
        ];
    }
}
```

For a view to work you still need a template engine configured on the app
(e.g. `app.set("view engine", …)`).

---

## 3. Folder naming — `static` and `templates`

`build.js` scans every folder under `modules/<module>/` and copies **only** the
ones named literally `static` and `templates` into
`dist/modules/<module>/`:

```text
modules/<module>/
├── controllers/
├── services/
├── types/
├── static/       ← must be named "static"
└── templates/    ← must be named "templates"
```

Keep those exact names. A folder called `assets`, `views`, or `Static` will be
**ignored by the build** and will not exist in production, where only `dist/`
is deployed.