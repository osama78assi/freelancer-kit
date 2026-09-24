export type SingletonStorage = {
    [key: string]: Object;
};

export type CacheOptions = {
    // Time-To-Live it's a milliseconds value
    ttl?: number;
};

export type CacheValue = {
    [key: string]: unknown;
    // Either null means live forever or has a date (ISO string) when it will be deleted
    ttl: null | string;
};