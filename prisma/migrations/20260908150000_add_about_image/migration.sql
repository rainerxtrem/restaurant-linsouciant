-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "aboutImageId" TEXT;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_aboutImageId_fkey" FOREIGN KEY ("aboutImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
