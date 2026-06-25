-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Player" (
    "playerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerName" TEXT NOT NULL DEFAULT '勇者',
    "tutorialCompleted" BOOLEAN NOT NULL DEFAULT false,
    "playerRank" INTEGER NOT NULL DEFAULT 1,
    "stamina" INTEGER NOT NULL DEFAULT 50,
    "maxStamina" INTEGER NOT NULL DEFAULT 50,
    "gold" INTEGER NOT NULL DEFAULT 5000,
    "diamond" INTEGER NOT NULL DEFAULT 500,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "title" TEXT,
    "bio" TEXT,
    "favoriteUnitId" TEXT,
    "loginDays" INTEGER NOT NULL DEFAULT 1,
    "lastLoginAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("playerId")
);

-- CreateTable
CREATE TABLE "OwnedUnit" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "awakenRank" INTEGER NOT NULL DEFAULT 0,
    "awakeningCount" INTEGER NOT NULL DEFAULT 0,
    "currentRarity" TEXT NOT NULL DEFAULT '1',
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OwnedUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerItem" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PlayerItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummonHistory" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "poolId" TEXT NOT NULL,
    "masterId" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "resultType" TEXT NOT NULL DEFAULT 'new',
    "pulledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SummonHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_userId_key" ON "Player"("userId");

-- CreateIndex
CREATE INDEX "Player_userId_idx" ON "Player"("userId");

-- CreateIndex
CREATE INDEX "OwnedUnit_playerId_idx" ON "OwnedUnit"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "PlayerItem_playerId_itemId_key" ON "PlayerItem"("playerId", "itemId");

-- CreateIndex
CREATE INDEX "PlayerItem_playerId_idx" ON "PlayerItem"("playerId");

-- CreateIndex
CREATE INDEX "SummonHistory_playerId_idx" ON "SummonHistory"("playerId");

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedUnit" ADD CONSTRAINT "OwnedUnit_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SummonHistory" ADD CONSTRAINT "SummonHistory_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
