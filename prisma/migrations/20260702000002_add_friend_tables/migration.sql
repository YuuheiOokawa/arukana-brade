-- Friend テーブル
CREATE TABLE "Friend" (
    "id"        TEXT         NOT NULL,
    "playerId"  TEXT         NOT NULL,
    "friendId"  TEXT         NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Friend_playerId_friendId_key" ON "Friend"("playerId", "friendId");
CREATE INDEX "Friend_playerId_idx" ON "Friend"("playerId");

ALTER TABLE "Friend"
    ADD CONSTRAINT "Friend_playerId_fkey"
    FOREIGN KEY ("playerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Friend"
    ADD CONSTRAINT "Friend_friendId_fkey"
    FOREIGN KEY ("friendId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

-- FriendRequest テーブル
CREATE TABLE "FriendRequest" (
    "id"           TEXT         NOT NULL,
    "fromPlayerId" TEXT         NOT NULL,
    "toPlayerId"   TEXT         NOT NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FriendRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FriendRequest_fromPlayerId_toPlayerId_key" ON "FriendRequest"("fromPlayerId", "toPlayerId");
CREATE INDEX "FriendRequest_toPlayerId_idx"   ON "FriendRequest"("toPlayerId");
CREATE INDEX "FriendRequest_fromPlayerId_idx" ON "FriendRequest"("fromPlayerId");

ALTER TABLE "FriendRequest"
    ADD CONSTRAINT "FriendRequest_fromPlayerId_fkey"
    FOREIGN KEY ("fromPlayerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FriendRequest"
    ADD CONSTRAINT "FriendRequest_toPlayerId_fkey"
    FOREIGN KEY ("toPlayerId") REFERENCES "Player"("playerId") ON DELETE CASCADE ON UPDATE CASCADE;
