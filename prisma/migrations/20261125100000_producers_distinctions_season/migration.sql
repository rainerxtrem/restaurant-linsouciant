-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "menusSeasonLabel" TEXT,
ADD COLUMN "menusSeasonLabelEn" TEXT;

-- CreateTable
CREATE TABLE "producers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "craft" TEXT,
    "craftEn" TEXT,
    "location" TEXT,
    "description" TEXT,
    "descriptionEn" TEXT,
    "imageId" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distinctions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "detailEn" TEXT,
    "imageId" TEXT,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "distinctions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "producers_order_idx" ON "producers"("order");

-- CreateIndex
CREATE INDEX "distinctions_order_idx" ON "distinctions"("order");

-- AddForeignKey
ALTER TABLE "producers" ADD CONSTRAINT "producers_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distinctions" ADD CONSTRAINT "distinctions_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reprise des distinctions saisies jusqu'ici dans le champ texte
-- « pressMentions » (une par ligne, « Nom — détail »).
INSERT INTO "distinctions" ("id", "name", "detail", "order")
SELECT
    'dm' || substr(md5(random()::text || t.line), 1, 23),
    trim(split_part(t.line, ' — ', 1)),
    NULLIF(trim(split_part(t.line, ' — ', 2)), ''),
    (t.ord - 1)::int
FROM "site_settings" s,
     regexp_split_to_table(COALESCE(s."pressMentions", ''), E'\n') WITH ORDINALITY AS t(line, ord)
WHERE s."id" = 'singleton' AND trim(t.line) <> '';
