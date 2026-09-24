export class Random {
    // Random integer between min and max (inclusive)
    public static randomIntBetween(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Random integer under max (0 to max - 1)
    public static randomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    // Generate random char/digit
    public static randomDigitChar(): string {
        const choice = this.randomInt(2);
        // 0 -> digit
        // 1 -> big char
        // 2 -> small char
        switch (choice) {
            case 0:
                return String.fromCharCode(this.randomIntBetween(48, 57));
            case 1:
                return String.fromCharCode(this.randomIntBetween(65, 90));
            case 2:
                return String.fromCharCode(this.randomIntBetween(97, 122));
        }

        // This won't be reached btw but typescript is complaining
        return "";
    }
}
