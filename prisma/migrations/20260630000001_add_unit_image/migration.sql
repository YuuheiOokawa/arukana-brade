-- キャラ画像管理テーブル追加
CREATE TABLE IF NOT EXISTS "UnitImage" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "imagePath" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UnitImage_unitId_rarity_key" ON "UnitImage"("unitId", "rarity");
CREATE INDEX IF NOT EXISTS "UnitImage_unitId_idx" ON "UnitImage"("unitId");
