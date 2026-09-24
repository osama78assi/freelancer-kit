-- RenameTable
ALTER TABLE "khamsatServices" RENAME TO "freelanceServices";

-- AlterPrimaryKey
ALTER TABLE "freelanceServices" RENAME CONSTRAINT "khamsatServices_pkey" TO "freelanceServices_pkey";

-- AlterForeignKey
ALTER TABLE "freelanceServices" RENAME CONSTRAINT "khamsatServices_parentServiceId_fkey" TO "freelanceServices_parentServiceId_fkey";