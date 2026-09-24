# Backend Build Flow — `build.js`

`build.js` lives at the backend root (next to `package.json`). It turns the
TypeScript source tree into a self-contained `dist/` folder. Only that folder is
deployed to the server, where the app is started with the `runProd` script
(`node main.js`).

It is a classic **compile → copy assets → install deps** pipeline:

1. Compile TypeScript to JavaScript.
2. Copy the package manifests (`package.json`, `package-lock.json`).
3. Copy the environment file (`.env`).
4. Copy each module's `static` / `templates` folders.
5. Install the production dependencies with `npm ci`.

Below is the detailed step-by-step flow, what it needs, and what
`package.json` must provide for it to work.

---

## Step 1 — Compile TypeScript

```js
const exec = promisify(childProcess.exec);
await exec("tsc");
```

Runs the TypeScript compiler with the options from `tsconfig.json` and emits
plain JavaScript into `dist/`, mirroring the source layout.

```text
src tree                      dist/
├── app.ts          ──────►   ├── app.js
├── index.ts        ──────►   ├── index.js
├── modules/        ──────►   ├── modules/
└── framework/      ──────►   └── framework/
```

Requirements:

- `tsconfig.json` **must** set `"outDir": "./dist"` (currently it is commented
  out; without it `tsc` writes the compiled files next to the sources).
- The whole app must compile cleanly — one failing file aborts the build.

---

## Step 2 — Copy the package manifests

```js
await copyFile("./package.json", "./dist/package.json");
await copyFile("./package-lock.json", "./dist/package-lock.json");
```

Both files are copied so that `npm ci` (Step 5) works *inside* `dist/`.
`npm ci` requires a `package-lock.json` that is in sync with `package.json`,
which is why the lockfile is copied along with the manifest.

---

## Step 3 — Copy the environment file

```js
await copyFile("./.env", "./dist/.env");
```

Secrets and configuration (database URL, ports, CORS allowed origins) are not
compiled into the code, so the `.env` file is carried into `dist/`.

`framework/util/dotenv.ts` exposes `readDotEnv(path)` which takes the env file
path explicitly, e.g.:

```ts
DotEnv.readDotEnv(join(__dirname, "./.env"));
```

Since it is a plain copy of the root `.env`, the shipped `.env` in `dist/` will
be picked up as long as the caller passes the right path.

---

## Step 4 — Copy module `static` / `templates`

```js
const distModules = await readdir("./dist/modules");
for (const distPathModule of distModules) {
    const distModulePath = join("./dist/modules", distPathModule);
    if ((await lstat(distModulePath)).isDirectory()) {
        const baseModulePath = join("./modules", distPathModule);
        for (const originalModuleEntity of await readdir(baseModulePath)) {
            const moduleEntityPath = join(baseModulePath, originalModuleEntity);
            // copy "static/"  -> dist/modules/<X>/static
            // copy "templates/" -> dist/modules/<X>/templates
        }
    }
}
```

For every module directory under `modules/` it looks at the **source** `modules/<X>/`
and copies two special folders into the compiled `dist/modules/<X>/`:

| Folder | Purpose |
|--------|---------|
| `static/` | Static assets served to the client (images, CSS, JS…) |
| `templates/` | Server-rendered view templates |

These folders are just copied (they are not compiled), so they would otherwise
be missing from `dist/`. The framework registers them at runtime through
`ExpressApp.registerController` → `controller.getStaticViews()`, which appends
them to Express's `views` setting, and `setParentPath`/`initRouter` handle the
routes.

---

## Step 5 — Install dependencies

```js
await exec("npm ci");
```

Runs in the **current working directory** (the backend root). For this to work
in a shipped context, `npm ci` must run **inside `dist/`** (where the copied
`package.json` / `package-lock.json` live), e.g.:

```bash
cd dist && npm ci
```

That makes `dist/` a standalone, runnable artifact.

---

## What `package.json` must have

The build only compiles + copies; the manifest is what makes `dist/` runnable.
These fields are required:

### 1. `"type": "module"`

The source uses ESM (`import`/`export`) and `tsconfig.json` emits
`"module": "esnext"`, so the compiled `.js` files are ESM. Node only runs them
when the package is marked as a module.

```jsonc
"type": "module"
```

### 2. `"main"` — development entry point

```jsonc
"main": "index.ts"
```

The `main` field is the entry point used by development tooling (e.g. `tsx`) to
start the app from source. Production never uses it — only the `dist/` folder is
deployed, and the app is booted there with the `runProd` script below.

### 3. `"scripts"` — build & start

```jsonc
"scripts": {
    "build": "node build.js",        // runs the whole pipeline
    "runProd": "node main.js",       // runs the compiled app (from dist/)
    "dev": "tsx --watch ."           // optional, development only
}
```

### 4. All runtime dependencies in `"dependencies"`

`npm ci` installs exactly what the manifest lists. Everything the app needs at
runtime must be a production dependency — `express`, `cors`, `cookie-parser`,
`zod`, `pg`, `@prisma/client`, `@prisma/adapter-pg`, `dotenv`, etc.
Build-only tooling (`typescript`, `tsx`, `prisma`, `@types/*`) belongs in
`"devDependencies"`.

### 5. `package-lock.json` in sync

`npm ci` fails unless the lockfile matches `package.json`. Keep it committed and
regenerate it with `npm install` after changing dependencies.

---

## Summary chart

| # | build.js does | Requires | Result |
|---|---------------|----------|--------|
| 1 | `tsc` | `outDir: "./dist"`, clean types | compiled JS |
| 2 | copy manifests | committed, in-sync lockfile | runnable `npm ci` |
| 3 | copy `.env` | — | env vars present |
| 4 | copy `static/` + `templates/` per module | those folders may exist per module | views & assets present |
| 5 | `npm ci` | `dependencies` complete, lockfile in sync | standalone `dist/` |

Only the `dist/` folder is pushed to the server. From there the app is
installed and started:

```bash
cd dist
npm ci
npm run runProd   # -> node main.js
```