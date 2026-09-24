import { SingletonStorage } from "./types";

export const singletonStorage: SingletonStorage = {};

export default abstract class Service {
    public static getInstance<T extends Service>(this: new () => T): T {
        const serviceName = this.name;
        
        if (singletonStorage[serviceName]) {
            return singletonStorage[serviceName] as T;
        }

        singletonStorage[serviceName] = new this();

        // Call the init
        (singletonStorage[serviceName] as T).init();

        return singletonStorage[serviceName] as T;
    }

    public abstract init(): void;
}
