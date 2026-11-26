-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "navOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
