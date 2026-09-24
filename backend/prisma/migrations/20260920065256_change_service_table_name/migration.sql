/*
  Warnings:

  - You are about to drop the `services` table. If the table is not empty, all the data it contains will be lost.

*/

-- AlterPrimaryKey
ALTER TABLE "services" RENAME CONSTRAINT "services_pkey" TO "khamsatServices_pkey";

-- AlterForeignKey
ALTER TABLE "services" RENAME CONSTRAINT "services_parentServiceId_fkey" to "khamsatServices_parentServiceId_fkey";

-- RenameTable
ALTER TABLE "services" RENAME TO "khamsatServices";