type APIErrorArgs = {
    statusCode: number;
    code: string;
    message: string;
    options?: ErrorOptions;
    extra?: Object;
};

export default class APIError extends Error {
    public code: string;
    public statusCode: number;
    public extra: Object | undefined;

    constructor({ code, message, statusCode, extra, options }: APIErrorArgs) {
        super(message, options);

        this.code = code;
        this.statusCode = statusCode;
        this.extra = extra;
    }
}
