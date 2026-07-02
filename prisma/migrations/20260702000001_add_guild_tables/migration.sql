-- CreateTable
CREATE TABLE "Guild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emblem" TEXT NOT NULL DEFAULT '⚔️',
    "description" TEXT NOT NULL DEFAULT '',
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GuildMember" (
    "id" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuildMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GuildMember_guildId_idx" ON "GuildMember"("guildId");

-- CreateIndex
CREATE UNIQUE INDEX "GuildMember_playerId_key" ON "GuildMember"("playerId");

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_guildId_fkey" FOREIGN KEY ("guildId") REFERENCES "Guild"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildMember" ADD CONSTRAINT "GuildMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
