-- Player: gameStateJson削除、新フィールド追加
ALTER TABLE "Player" DROP COLUMN IF EXISTS "gameStateJson";
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "staminaRecoveryTime" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "arcanaPlayerId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "miscData" JSONB NOT NULL DEFAULT '{}';

-- OwnedUnit: 既存データをクリアして再構成
TRUNCATE TABLE "OwnedUnit" CASCADE;
ALTER TABLE "OwnedUnit" DROP CONSTRAINT IF EXISTS "OwnedUnit_pkey";
ALTER TABLE "OwnedUnit" DROP COLUMN IF EXISTS "id";
ALTER TABLE "OwnedUnit" DROP COLUMN IF EXISTS "createdAt";
ALTER TABLE "OwnedUnit" DROP COLUMN IF EXISTS "updatedAt";
ALTER TABLE "OwnedUnit" DROP COLUMN IF EXISTS "acquiredAt";
ALTER TABLE "OwnedUnit" ADD COLUMN IF NOT EXISTS "instanceId" TEXT NOT NULL DEFAULT '';
ALTER TABLE "OwnedUnit" ADD COLUMN IF NOT EXISTS "acquiredAt" BIGINT NOT NULL DEFAULT 0;
ALTER TABLE "OwnedUnit" ADD CONSTRAINT "OwnedUnit_pkey" PRIMARY KEY ("instanceId");

-- PlayerItem: クリア
TRUNCATE TABLE "PlayerItem" CASCADE;

-- 新テーブル作成
CREATE TABLE IF NOT EXISTS "OwnedEquipment" (
    "instanceId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "equippedTo" TEXT,
    CONSTRAINT "OwnedEquipment_pkey" PRIMARY KEY ("instanceId")
);

CREATE TABLE IF NOT EXISTS "PlayerQuestProgress" (
    "playerId" TEXT NOT NULL,
    "clearedStageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "claimedAreaRewards" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastSelectedWorldId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerQuestProgress_pkey" PRIMARY KEY ("playerId")
);

CREATE TABLE IF NOT EXISTS "PlayerParty" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'パーティ',
    "slots" JSONB NOT NULL DEFAULT '[]',
    "leaderId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PlayerParty_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PlayerMissionProgress" (
    "playerId" TEXT NOT NULL,
    "dailyDate" TEXT NOT NULL DEFAULT '',
    "dailyData" JSONB NOT NULL DEFAULT '[]',
    "weeklyData" JSONB NOT NULL DEFAULT '[]',
    "weekStr" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerMissionProgress_pkey" PRIMARY KEY ("playerId")
);

CREATE TABLE IF NOT EXISTS "PlayerLoginBonus" (
    "playerId" TEXT NOT NULL,
    "lastClaimedDate" TEXT,
    "lastLoginDate" TEXT,
    "claimedDays" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "currentDay" INTEGER NOT NULL DEFAULT 1,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerLoginBonus_pkey" PRIMARY KEY ("playerId")
);

CREATE TABLE IF NOT EXISTS "PlayerArenaRecord" (
    "playerId" TEXT NOT NULL,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "rank" INTEGER NOT NULL DEFAULT 999,
    "points" INTEGER NOT NULL DEFAULT 1000,
    "season" INTEGER NOT NULL DEFAULT 1,
    "battleHistory" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PlayerArenaRecord_pkey" PRIMARY KEY ("playerId")
);

-- Foreign keys
ALTER TABLE "OwnedEquipment" ADD CONSTRAINT "OwnedEquipment_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerQuestProgress" ADD CONSTRAINT "PlayerQuestProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerParty" ADD CONSTRAINT "PlayerParty_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerMissionProgress" ADD CONSTRAINT "PlayerMissionProgress_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerLoginBonus" ADD CONSTRAINT "PlayerLoginBonus_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerArenaRecord" ADD CONSTRAINT "PlayerArenaRecord_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS "OwnedEquipment_playerId_idx" ON "OwnedEquipment"("playerId");
CREATE UNIQUE INDEX IF NOT EXISTS "PlayerParty_playerId_partyId_key" ON "PlayerParty"("playerId", "partyId");
CREATE INDEX IF NOT EXISTS "PlayerParty_playerId_idx" ON "PlayerParty"("playerId");
