import { Random } from "./util/random";
import { Cache, CacheCleaner } from "./cache";
import { CacheOptions, CacheValue } from "./types";

export class MemoryCache extends CacheCleaner implements Cache {
    static instance: MemoryCache;
    private cache!: {
        [key: string]: CacheValue;
    };

    public constructor() {
        super();
    }

    public static getInstance() {
        if (this.instance) return this.instance;

        this.instance = new MemoryCache();

        // In that function goes the entire logic
        this.instance.init();

        return this.instance;
    }

    private init() {
        this.cache = {};

        // Start the random cleaner interval
        this.randomCleaner();
    }

    public getVal(key: string): any | undefined {
        const matchedValue = this.cache[key];

        // No object at all
        if (matchedValue === undefined) return null;

        // Semi Lazy expiration. Check if the date is stil valid
        if (!this.isExpired(matchedValue)) return matchedValue[key];

        // If it's expired already delete it and return undefiend
        delete this.cache[key];

        return undefined;
    }

    public setVal(key: string, value: any, options: CacheOptions): void {
        if (options.ttl === undefined) {
            this.cache[key] = { [key]: value, ttl: null };
        } else {
            // Calc the date
            const time = Date.now() + options.ttl;
            const ttl = new Date(time);
            this.cache[key] = { [key]: value, ttl: ttl.toISOString() };
        }
    }

    public deleteVal(key: string): boolean {
        if (delete this.cache[key]) {
            return true;
        }
        return false;
    }

    // Very simple. every 1 minute check 100 random keys and delete them if they are expired
    protected randomCleaner(): void {
        setInterval(() => {
            // Get random keys
            let maxIterations = 100;

            // Store a set of tuple (key, cachedValue)
            const cacheValueTuples = new Set<[string, CacheValue]>();

            // Iterate 100 times
            while (maxIterations-- && Object.keys(this.cache).length !== 0) {
                // 100 Percent there is a key
                const randIndex = Random.randomIntBetween(
                    0,
                    Object.keys(this.cache).length - 1,
                );
                const key = Object.keys(this.cache)[randIndex] as string;

                // Pick that key and add it to the set
                cacheValueTuples.add([key, this.cache[key] as CacheValue]);
            }

            // Loop over the keys and check their expiration
            for (const cacheValueTuple of cacheValueTuples) {
                if (this.isExpired(cacheValueTuple[1]))
                    this.deleteVal(cacheValueTuple[0]);
            }
        }, 1000 * 2);
    }

    private isExpired(cacheValue: CacheValue): boolean {
        if (cacheValue.ttl === null) return false;

        return new Date(cacheValue.ttl) < new Date();
    }

    public getCache() {
        return this.cache;
    }
}
