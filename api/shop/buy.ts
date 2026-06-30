import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

const STAMINA_PACKS = [
  { id: 'sp1', amount: 20,  diamondCost: 10 },
  { id: 'sp2', amount: 50,  diamondCost: 20 },
  { id: 'sp3', amount: -1,  diamondCost: 50 },
] as const;

const ITEM_SHOP = [
  { id: 'is1', itemId: 'item_exp_s',              quantity: 10, diamondCost: 30,  goldCost: 0 },
  { id: 'is2', itemId: 'item_exp_m',              quantity: 5,  diamondCost: 50,  goldCost: 0 },
  { id: 'is3', itemId: 'item_exp_l',              quantity: 3,  diamondCost: 100, goldCost: 0 },
  { id: 'is4', itemId: 'item_stamina_potion',     quantity: 3,  diamondCost: 80,  goldCost: 0 },
  { id: 'is5', itemId: 'item_summon_ticket',      quantity: 1,  diamondCost: 150, goldCost: 0 },
  { id: 'is6', itemId: 'item_awakening_crystal',  quantity: 1,  diamondCost: 200, goldCost: 0 },
  { id: 'is7', itemId: 'item_stone_core',         quantity: 10, diamondCost: 0,   goldCost: 50000 },
  { id: 'is8', itemId: 'item_magic_crystal',      quantity: 5,  diamondCost: 0,   goldCost: 30000 },
] as const;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findFirst({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as { category?: string; packId?: string };
  const { category, packId } = body;
  if (!category || !packId) return res.status(400).json({ error: 'Missing category or packId' });

  if (category === 'stamina') {
    const pack = STAMINA_PACKS.find(p => p.id === packId);
    if (!pack) return res.status(400).json({ error: 'Invalid pack' });
    if (player.diamond < pack.diamondCost) return res.status(400).json({ error: 'ダイヤが不足しています' });

    const staminaAdd = pack.amount === -1
      ? Math.max(0, player.maxStamina - player.stamina)
      : pack.amount;
    const newStamina = clamp(player.stamina + staminaAdd, 0, player.maxStamina);
    const newDiamond = player.diamond - pack.diamondCost;

    const updated = await prisma.player.update({
      where: { playerId: player.playerId },
      data: { diamond: newDiamond, stamina: newStamina },
    });

    return res.status(200).json({
      ok: true,
      diamond: updated.diamond,
      stamina: updated.stamina,
      staminaAdded: staminaAdd,
    });
  }

  if (category === 'item') {
    const shop = ITEM_SHOP.find(s => s.id === packId);
    if (!shop) return res.status(400).json({ error: 'Invalid pack' });

    let newDiamond = player.diamond;
    let newGold = player.gold;

    if (shop.diamondCost > 0) {
      if (player.diamond < shop.diamondCost) return res.status(400).json({ error: 'ダイヤが不足しています' });
      newDiamond -= shop.diamondCost;
    } else if (shop.goldCost > 0) {
      if (player.gold < shop.goldCost) return res.status(400).json({ error: 'ゴールドが不足しています' });
      newGold -= shop.goldCost;
    }

    await prisma.$transaction(async tx => {
      await tx.player.update({
        where: { playerId: player.playerId },
        data: { diamond: newDiamond, gold: newGold },
      });
      await tx.playerItem.upsert({
        where: { playerId_itemId: { playerId: player.playerId, itemId: shop.itemId } },
        update: { quantity: { increment: shop.quantity } },
        create: { playerId: player.playerId, itemId: shop.itemId, quantity: shop.quantity },
      });
    });

    return res.status(200).json({
      ok: true,
      diamond: newDiamond,
      gold: newGold,
      itemId: shop.itemId,
      quantityAdded: shop.quantity,
    });
  }

  return res.status(400).json({ error: 'Unknown category' });
}
