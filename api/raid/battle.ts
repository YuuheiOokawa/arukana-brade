import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';
import { getTokenFromRequest, verifyToken } from '../../lib/auth.js';

const MAX_DAMAGE_PER_BATTLE = 2_000_000;
const DEFAULT_BOSS_HP: Record<string, number> = {
  raid_dark_lord: 10_000_000,
};
const FALLBACK_HP = 10_000_000;

interface RaidState {
  bossId: string;
  currentHp: number;
  totalDamageDealt: number;
  entryCount: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const token = getTokenFromRequest(req.headers.cookie);
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Invalid token' });

  const player = await prisma.player.findFirst({ where: { userId: payload.userId } });
  if (!player) return res.status(404).json({ error: 'Player not found' });

  const body = req.body as { bossId?: string; damageDealt?: number };
  const bossId = typeof body.bossId === 'string' ? body.bossId : null;
  const damage = Math.min(Math.max(0, Number(body.damageDealt) || 0), MAX_DAMAGE_PER_BATTLE);
  if (!bossId) return res.status(400).json({ error: 'Missing bossId' });

  const miscData = (player.miscData ?? {}) as Record<string, unknown>;
  const raidStates: RaidState[] = Array.isArray(miscData.raidStates)
    ? (miscData.raidStates as RaidState[])
    : [];

  const existing = raidStates.find(s => s.bossId === bossId);
  const bossMaxHp = DEFAULT_BOSS_HP[bossId] ?? FALLBACK_HP;
  const newState: RaidState = existing
    ? {
        ...existing,
        currentHp: Math.max(0, existing.currentHp - damage),
        totalDamageDealt: existing.totalDamageDealt + damage,
        entryCount: existing.entryCount + 1,
      }
    : { bossId, currentHp: Math.max(0, bossMaxHp - damage), totalDamageDealt: damage, entryCount: 1 };

  const updatedRaidStates = existing
    ? raidStates.map(s => s.bossId === bossId ? newState : s)
    : [...raidStates, newState];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newMiscData: any = JSON.parse(JSON.stringify({ ...miscData, raidStates: updatedRaidStates }));
  await prisma.player.update({
    where: { playerId: player.playerId },
    data: { miscData: newMiscData },
  });

  return res.status(200).json({ ok: true, raidState: newState });
}
