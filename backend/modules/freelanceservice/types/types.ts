import { Currency, Prisma } from "../../../generated/prisma/client";
import { FreelanceServiceModel } from "../../../generated/prisma/models";

export type FreelanceServiceModelIdsString = Omit<
    Omit<FreelanceServiceModel, "id">,
    "parentServiceId"
> &
    FreelanceServiceStringIds;

export type FreelanceServiceStringIds = {
    id: string;
    parentServiceId: string | null;
};

export type GetFreelanceServicesArgs = {
    data: FreelanceServiceModelIdsString[];
    total: number;
};

export type Statistics = {
    title: string;
    currency: Currency;
    highestPriceInService: Prisma.Decimal;
    lowestPriceInService: Prisma.Decimal;
    avgPriceInService: Prisma.Decimal;
    totalServicesCount: bigint;
};

export type StatisticsStr = {
    title: string;
    currency: Currency;
    highestPriceInService: string;
    lowestPriceInService: string;
    avgPriceInService: string;
    totalServicesCount: string;
};
