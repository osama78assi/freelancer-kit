import {
    NextFunction,
    Request,
    Response,
    Router,
    RouterOptions,
} from "express";
import Controller from "../../../framework/controller";
import FreelanceServiceService from "../services/freelanceService.service";
import { Decorators } from "../../../framework/decorators";
import zod, { number } from "zod";
import APIError from "../../../framework/APIError";
import { Currency } from "../../../generated/prisma/enums";
import {
    FreelanceServiceModel,
    FreelanceServiceUpdateInput,
} from "../../../generated/prisma/models";

export class FreelanceServiceController extends Controller {
    private serviceService!: FreelanceServiceService;

    protected init(routerOptions?: RouterOptions): void {
        this.serviceService = FreelanceServiceService.getInstance();

        super.init(routerOptions);
    }

    protected initRouter(): void {
        this.routes.post("/services", this.createService);
        this.routes.get("/services", this.getServices);
        this.routes.delete("/services/:id", this.deleteService);
        this.routes.patch("/services/:id", this.updateService);
        this.routes.get("/services/statistics/best", this.getBestStatistics);
        this.routes.get("/services/statistics/:title", this.getStatistics);
        this.routes.get("/services/statistics", this.getStatistics);

        this.setParentPath("/api/v1/");
    }

    @Decorators.RequestHandler
    private async createService(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const obj = req?.body ?? {};

            if (Object.keys(obj).length === 0)
                throw new APIError({
                    statusCode: 400,
                    code: "MISSING_DATA",
                    message: "Please provide the data to create the service",
                });

            const schema = zod
                .object({
                    title: zod
                        .string({
                            error: "The title must required as a string",
                        })
                        .trim()
                        .max(400, {
                            error: "The title mustn't exceed 400 character length",
                        }),
                    content: zod.string({
                        error: "The content is required as a string",
                    }),
                    price: zod
                        .number({ error: "The price is required as a number" })
                        .positive({
                            error: "The price must be a valid positive number",
                        }),
                    currency: zod.enum(Currency, {
                        error: "The currency isn't recognized",
                    }),
                    parentServiceId: zod
                        .string()
                        .regex(/\d+/, {
                            error: "The parent service id must be a number",
                        })
                        .pipe(zod.transform((num) => BigInt(num)))
                        .optional(),
                })
                .transform((obj) => {
                    return Object.fromEntries(
                        Object.entries(obj).filter(
                            ([, value]) => value !== undefined,
                        ),
                    ) as unknown as FreelanceServiceModel;
                });

            const serviceObject = schema.parse(obj);

            const service =
                await this.serviceService.createService(serviceObject);

            return res.status(200).json({
                data: service,
            });
        } catch (err) {
            next(err);
        }
    }

    @Decorators.RequestHandler
    private async getServices(req: Request, res: Response, next: NextFunction) {
        try {
            // Limit and offset
            const query = req?.query;

            const schema = zod.object({
                limit: zod
                    .string()
                    .trim()
                    .regex(/\d+/)
                    .transform((num) => Number(num))
                    .pipe(number().int().max(100))
                    .default(100),
                from: zod
                    .string()
                    .trim()
                    .regex(/\d+/)
                    .transform((num) => Number(num))
                    .pipe(
                        number().int().gte(1, {
                            error: "The starting page can't be less than 1",
                        }),
                    )
                    .default(1),
                q: zod.string().max(400).optional(),
            });

            const { limit, from, q } = schema.parse(query);

            const { data, total } = await this.serviceService.getServices({
                from,
                limit,
                query: q,
            });

            return res.status(200).json({
                data,
                total,
            });
        } catch (err) {
            next(err);
        }
    }

    @Decorators.RequestHandler
    private async deleteService(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { id } = req?.params ?? { id: null };

            if (!id || Array.isArray(id)) {
                throw new APIError({
                    code: "INVALID_ID",
                    statusCode: 400,
                    message: "Invalid id received",
                });
            }

            await this.serviceService.deleteService(BigInt(id));

            return res.status(200).json({
                message: "Service deleted successfully",
            });
        } catch (err) {
            next(err);
        }
    }

    @Decorators.RequestHandler
    private async updateService(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const { id } = req?.params ?? { id: null };

            if (!id || Array.isArray(id)) {
                throw new APIError({
                    statusCode: 400,
                    message: "Invalid id received",
                    code: "INVALID_ID",
                });
            }

            let obj = req?.body ?? {};

            if (Object.keys(obj).length === 0)
                throw new APIError({
                    statusCode: 400,
                    code: "INVALID_INPUT",
                    message: "Please specify at least one field to update",
                });

            const schema = zod
                .object({
                    title: zod
                        .string({ error: "The title is required as a string" })
                        .trim()
                        .max(400, {
                            error: "The title must not exceed 400 character length",
                        })
                        .optional(),
                    content: zod
                        .string({
                            error: "The content is required as a string",
                        })
                        .trim()
                        .optional(),
                    price: zod
                        .number({ error: "The price is required as a number" })
                        .positive({
                            error: "The price must be a valid positive number",
                        })
                        .optional(),
                    currency: zod
                        .enum(Currency, {
                            error: "The currency isn't recognized",
                        })
                        .optional(),
                })
                .transform((obj) =>
                    // Filter those are undefined out
                    Object.fromEntries(
                        Object.entries(obj).filter(
                            ([, value]) => value !== undefined,
                        ),
                    ),
                );

            const parsedObj = schema.parse(obj);

            const updatedService = await this.serviceService.updateService(
                BigInt(id),
                parsedObj as FreelanceServiceUpdateInput,
            );

            return res.status(200).json({
                data: updatedService,
            });
        } catch (err) {
            next(err);
        }
    }

    @Decorators.RequestHandler
    private async getBestStatistics(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            const statistics = await this.serviceService.getBestStatistics();

            return res.status(200).json({
                data: statistics,
            });
        } catch (err) {
            next(err);
        }
    }

    @Decorators.RequestHandler
    private async getStatistics(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        try {
            // Get the pagination information
            const query = req?.query ?? {};

            const querySchema = zod.object({
                limit: zod
                    .string()
                    .trim()
                    .regex(/\d+/)
                    .transform((num) => Number(num))
                    .pipe(number().int().max(100))
                    .default(100),
                from: zod
                    .string()
                    .trim()
                    .regex(/\d+/)
                    .transform((num) => Number(num))
                    .pipe(
                        number().int().gte(1, {
                            error: "The starting page can't be less than 1",
                        }),
                    )
                    .default(1),
            });

            // Parse the title if provided
            const params = req?.params ?? {};

            const paramsSchema = zod.object({
                title: zod
                    .string({ error: "The title must be provided as a string" })
                    .max(400, {
                        error: "The title service must be 400 character length maximum",
                    })
                    .optional(),
            });

            const parsedQuery = querySchema.parse(query);
            const parsedParams = paramsSchema.parse(params);

            const results = await this.serviceService.getStatistics(
                parsedQuery.from,
                parsedQuery.limit,
                parsedParams.title,
            );

            res.status(200).json({
                data: results.data,
                total: results.total,
            });
        } catch (err) {
            next(err);
        }
    }
}
