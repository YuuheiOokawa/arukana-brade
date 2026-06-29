-- AddColumn: gameStateJson to Player
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "gameStateJson" JSONB;
