-- PlayerItem.quantity は 0 以上のみ許可
ALTER TABLE "PlayerItem" ADD CONSTRAINT "PlayerItem_quantity_check" CHECK ("quantity" >= 0);
