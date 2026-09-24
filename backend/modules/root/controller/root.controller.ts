import {
    NextFunction,
    Request,
    Response,
    RouterOptions,
    static as static_,
} from "express";
import Controller from "../../../framework/controller";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { readFile } from "fs/promises";
import { ManifestPaths } from "../types/types";
import { Decorators } from "../../../framework/decorators";

export class RootController extends Controller {
    protected init(routerOptions?: RouterOptions): void {
        super.init(routerOptions);
    }

    protected override initRouter(): void {
        this.routes.get("/", this.getMainApp);
        
        // The statics
        this.initStatics();
    }

    public override getStaticViews(): string[] {
        return [join(__dirname, "../templates")];
    }

    protected override initStatics() {
        // Call with the route of statics and the folder
        super.initStatics(join(__dirname, "../static/"), "/statics");
    }

    @Decorators.RequestHandler
    private async getMainApp(req: Request, res: Response, next: NextFunction) {
        try {
            // Read the mapped css and js file names. Expected one file css and one file js
            const manifest = JSON.parse(
                (
                    await readFile(
                        join(
                            __dirname,
                            "../static/.vite/manifest.json",
                        ),
                    )
                ).toString("utf-8"),
            ) as ManifestPaths;

            res.render("index", {
                js: `/statics/${manifest["index.html"]?.file}`,
                css: manifest["index.html"]?.css?.map(
                    (css) => `/statics/${css}`,
                ),
            });
        } catch (err) {
            next(err);
        }
    }
}
