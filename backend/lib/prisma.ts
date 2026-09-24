import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import DotEnv from "../framework/util/dotenv";

// Specify the URL for the database

// export const connectionString = `${DotEnv.getEnv("DATABASE_URL")}`;
// Check the env
const env = DotEnv.getEnv("NODE_ENV");

const connectionString =
    env?.toUpperCase() === "DEVELOPMENT"
        ? DotEnv.getEnv("DATABASE_URL_DEV")
        : env?.toUpperCase() === "PRODUCTION"
          ? DotEnv.getEnv("DATABASE_URL")
          : "";

// Create an adapter to be able to connect
// between Prisma and the dirver
// of the database you have selected
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma, connectionString };
