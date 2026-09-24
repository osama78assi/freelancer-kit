import { dirname, join } from "path";
import App from "./app.js";
import DotEnv from "./framework/util/dotenv.js";
import { fileURLToPath } from "url";

class Main {
    public static async main(): Promise<void> {
        DotEnv.readDotEnv(join(__dirname, "./.env"));

        const mainApp = new App();

        await mainApp.init();

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

Main.main();
