// When the application scale this will no longer be valid as we need to shift to in-memory database like Redis

import { CacheOptions } from "./types";

// But with this class inplace it will be much easier to shift
export interface Cache {
    // It may throw an error in case not exists
    getVal(key: string): any | never;

    // Set the item in the memory cache, the time-to-live is milleseconds
    setVal(key: string, value: any, options: CacheOptions): void;

    // Delete an item from the memory cache
    deleteVal(key: string): boolean;
}

export abstract class CacheCleaner {
    // Let the cache check random keys and check their ttl whether they need to be
    // deleted or not; this method is usless in Redis as it do that internally
    protected abstract randomCleaner(): void;
}
