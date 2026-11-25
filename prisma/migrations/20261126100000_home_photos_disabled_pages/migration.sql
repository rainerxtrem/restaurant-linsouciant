-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "disabledPages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "homePhotoMainId" TEXT,
ADD COLUMN "homePhotoSecondId" TEXT;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_homePhotoMainId_fkey" FOREIGN KEY ("homePhotoMainId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_homePhotoSecondId_fkey" FOREIGN KEY ("homePhotoSecondId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
