-- AlterTable
ALTER TABLE "menus" ADD COLUMN "themePageId" TEXT;

-- CreateTable
CREATE TABLE "theme_pages" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "navLabel" TEXT,
    "navLabelEn" TEXT,
    "intro" TEXT,
    "introEn" TEXT,
    "orderInfo" TEXT,
    "orderInfoEn" TEXT,
    "heroImageId" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_products" (
    "id" TEXT NOT NULL,
    "themePageId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "imageId" TEXT,
    "prices" JSONB NOT NULL DEFAULT '[]',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "theme_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "theme_pages_slug_key" ON "theme_pages"("slug");

-- CreateIndex
CREATE INDEX "theme_pages_enabled_order_idx" ON "theme_pages"("enabled", "order");

-- CreateIndex
CREATE INDEX "theme_products_themePageId_order_idx" ON "theme_products"("themePageId", "order");

-- AddForeignKey
ALTER TABLE "menus" ADD CONSTRAINT "menus_themePageId_fkey" FOREIGN KEY ("themePageId") REFERENCES "theme_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_pages" ADD CONSTRAINT "theme_pages_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_products" ADD CONSTRAINT "theme_products_themePageId_fkey" FOREIGN KEY ("themePageId") REFERENCES "theme_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_products" ADD CONSTRAINT "theme_products_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
