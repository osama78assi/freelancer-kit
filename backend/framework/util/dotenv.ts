import dotenv from "dotenv";

class DotEnv {
    public static getEnv(key: string): string | undefined {
        return process.env[key];
    }

    public static readDotEnv(path: string): void {
        dotenv.config({
            path,
        });
    }
}

export default DotEnv;
