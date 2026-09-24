import childProcess from "child_process";
import { cp, lstat, readdir, copyFile } from "fs/promises";
import { basename, dirname, join } from "path";
import { promisify } from "util";

(async () => {
    // Run the command tsc over the current directory
    console.log("Compiling Typescript Code...");

    const exec = promisify(childProcess.exec);
    await exec("tsc");
    console.log("Code compiled to JavaScript successfully ✅");

    console.log(
        "Copying package.json and package-lock.json to the dist folder...",
    );

    await copyFile("./package.json", "./dist/package.json");
    await copyFile("./package-lock.json", "./dist/package-lock.json");

    console.log("Copied successfully ✅");

    console.log("Copying enviroment variable file...");
    await copyFile("./.env", "./dist/.env");
    console.log("Copied successfully ✅");

    console.log("Coping static files & templates...");

    // Gives the modules like /auth /users
    const distModules = await readdir("./dist/modules");

    // Loop over the modules we have in the dist
    for (const distPathModule of distModules) {
        // The path for modules like ./dist/modules/auth
        const distModulePath = join("./dist/modules", distPathModule);

        // Check if the given path is directory or not
        if ((await lstat(distModulePath)).isDirectory()) {
            // The same module but in its directory not in the dist folder
            // Like modules/auth or modules/user
            const baseModulePath = join("./modules", distPathModule);

            const baseModuleDir = await readdir(baseModulePath);

            // Loop over the entities of the module like modules/auth/controllers or modules/user/services
            for (const originalModuleEntity of baseModuleDir) {
                // Get stat of ./modules/Module/controllers or static or whatever
                const moduleEntityPath = join(
                    baseModulePath,
                    originalModuleEntity,
                );

                const stat = await lstat(moduleEntityPath);

                // If the folder inside the module is a static
                if (
                    stat.isDirectory() &&
                    basename(moduleEntityPath) === "static"
                ) {
                    // Recursivly copy the content from the original module to the dist module
                    await cp(join(moduleEntityPath), join(distModulePath, "static"), {
                        recursive: true,
                    });
                } else if (
                    stat.isDirectory() &&
                    basename(moduleEntityPath) === "templates"
                ) {
                    // Recursivly copy the content from the original module to the dist module
                    await cp(join(moduleEntityPath), join(distModulePath, "templates"), {
                        recursive: true,
                    });
                }
            }
        }
    }

    console.log("Copied static files & templates successfully ✅");

    console.log("Installing node modules...");
    await exec("npm ci");
    console.log("Installed successfully ✅");
    console.log("The application is ready to shipe ✅");
})();
