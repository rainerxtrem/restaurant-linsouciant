-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "pressMentions" TEXT;

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "imageId" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "contentEn" TEXT,
    "buttonLabel" TEXT,
    "buttonLabelEn" TEXT,
    "buttonUrl" TEXT,
    "dismissDays" INTEGER NOT NULL DEFAULT 7,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
