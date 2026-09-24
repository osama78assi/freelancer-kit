import { Sql } from "@prisma/client/runtime/client";
import APIError from "../../../framework/APIError";
import Service from "../../../framework/service";
import { Prisma } from "../../../generated/prisma/client";
import {
    FreelanceServiceModel,
    FreelanceServiceUpdateInput,
    FreelanceServiceWhereInput,
} from "../../../generated/prisma/models";
import { prisma } from "../../../lib/prisma";
import { SystemUtil } from "../../../util/util";
import {
    Statistics,
    StatisticsStr,
    FreelanceServiceModelIdsString,
    GetFreelanceServicesArgs,
} from "../types/types";

export default class FreelanceServiceService extends Service {
    public init(): void {}

    public async getTotalServices(withAdditional: boolean = false) {
        let where: FreelanceServiceWhereInput = {};
        if (!withAdditional) {
            where = { parentServiceId: null };
        }

        return await prisma.freelanceService.count({ where });
    }

    public async getServices({
        from = 1,
        limit = 10,
        query,
    }: {
        from: number;
        limit: number;
        query?: string | undefined;
    }): Promise<GetFreelanceServicesArgs | never> {
        try {
            let where: FreelanceServiceWhereInput = {
                ...(query
                    ? { title: { contains: query, mode: "insensitive" } }
                    : {}),
                parentServiceId: null,
            };

            const services = await prisma.freelanceService.findMany({
                skip: (from - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },

                include: {
                    additionalServices: true,
                },
                where,
            });

            const total = await prisma.freelanceService.count({ where });

            return {
                data: services.map((service) => ({
                    ...service,
                    additionalServices: service.additionalServices.map(
                        (service) => this.convertBigIntToString(service),
                    ),
                    ...this.convertBigIntToString(service, true),
                })),
                total,
            };
        } catch (err) {
            throw err;
        }
    }

    public async deleteService(id: bigint): Promise<boolean | never> {
        try {
            const results = await prisma.freelanceService.deleteMany({
                where: {
                    id,
                },
            });

            if (results.count === 0)
                throw new APIError({
                    statusCode: 404,
                    message:
                        "There is no service with the provided id or it's already deleted",
                    code: "SERVICE_NOT_FOUND",
                });

            return true;
        } catch (err) {
            throw err;
        }
    }

    public async updateService(
        id: bigint,
        fields: FreelanceServiceUpdateInput,
    ): Promise<FreelanceServiceModelIdsString | never> {
        try {
            const service = await prisma.freelanceService.update({
                where: {
                    id,
                    parentService: null,
                },
                data: fields,
            });

            if (service === null) {
                throw new APIError({
                    statusCode: 404,
                    message: "The service isn't found or it's already deleted",
                    code: "NOT_FOUND",
                });
            }

            return this.convertBigIntToString(
                service,
            ) as FreelanceServiceModelIdsString;
        } catch (err) {
            throw err;
        }
    }

    public async createService(
        data: FreelanceServiceModel,
    ): Promise<FreelanceServiceModelIdsString | never> {
        try {
            const service = await prisma.freelanceService.create({
                data,
            });

            return this.convertBigIntToString(
                service,
            ) as FreelanceServiceModelIdsString;
        } catch (err) {
            throw err;
        }
    }

    public async getBestStatistics(): Promise<StatisticsStr[] | never> {
        try {
            const data = await prisma.$queryRaw<Statistics[]>`
            SELECT
                LOWER(title) AS "title",
                currency,
                MAX(price) AS "highestPriceInService",
                MIN(price) AS "lowestPriceInService",
                AVG(price) AS "avgPriceInService",
                COUNT(LOWER(title)) AS "totalServicesCount"
            FROM
            "freelanceServices"
            WHERE "freelanceServices"."parentServiceId" IS null
            GROUP BY LOWER(title), currency
            ORDER BY
                "totalServicesCount" DESC,
                "highestPriceInService" DESC,
                "avgPriceInService" DESC
            LIMIT 10
            `;

            return data.map((item) => ({
                title: item.title,
                currency: item.currency,
                avgPriceInService: item.avgPriceInService.toString(),
                highestPriceInService: item.highestPriceInService.toString(),
                lowestPriceInService: item.lowestPriceInService.toString(),
                totalServicesCount: item.totalServicesCount.toString(),
            }));
        } catch (err) {
            throw err;
        }
    }

    public async getStatistics(
        from: number = 1,
        limit: number = 10,
        serviceTitle?: string,
    ): Promise<{ data: StatisticsStr[]; total: number } | never> {
        try {
            let whereClause: Sql;
            if (serviceTitle) {
                whereClause = Prisma.sql`WHERE "freelanceServices"."parentServiceId" IS null AND title ilike (${serviceTitle.concat('%')})`;
            } else {
                whereClause = Prisma.sql`WHERE "freelanceServices"."parentServiceId" IS null`;
            }

            const offset = (from - 1) * limit;

            const data = await prisma.$queryRaw<Statistics[]>`
            SELECT
                LOWER(title) AS "title",
                currency,
                MAX(price) AS "highestPriceInService",
                MIN(price) AS "lowestPriceInService",
                AVG(price) AS "avgPriceInService",
                COUNT(LOWER(title)) AS "totalServicesCount"
            FROM
            "freelanceServices"
            ${whereClause}
            GROUP BY LOWER(title), currency
            ORDER BY
                "totalServicesCount" DESC,
                "highestPriceInService" DESC,
                "avgPriceInService" DESC
            OFFSET ${offset}
            LIMIT ${limit}
            `;

            // No need to run that entire heavy query, only the grouping is enough to count
            const total = await prisma.$queryRaw<{ total: number }>`
            SELECT COUNT(*) as "total" FROM (
                SELECT
                    1
                FROM
                "freelanceServices"
                ${whereClause}
                GROUP BY LOWER(title), currency
            )
            `;

            return {
                data: data.map((item) => ({
                    title: item.title,
                    currency: item.currency,
                    avgPriceInService: item.avgPriceInService.toString(),
                    highestPriceInService:
                        item.highestPriceInService.toString(),
                    lowestPriceInService: item.lowestPriceInService.toString(),
                    totalServicesCount: item.totalServicesCount.toString(),
                })),
                total: total.total,
            };
        } catch (err) {
            throw err;
        }
    }

    // Helpers
    private convertBigIntToString(
        service: FreelanceServiceModel,
        giveOnlyIds: boolean = false,
    ):
        | FreelanceServiceModelIdsString
        | { id: string; parentServiceId: string | null } {
        const ids = {
            id: service.id.toString(),
            parentServiceId: service.parentServiceId
                ? service.parentServiceId?.toString?.()
                : null,
        };

        if (giveOnlyIds) return ids;
        return {
            ...service,
            ...ids,
        };
    }
}
