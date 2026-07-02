/**
 * /api/master  — マスタデータ・画像パスを1ファイルに統合
 * GET              → マスタデータ（units/enemies/items/equipment/quests）
 * GET ?type=images → キャラ画像パス一覧
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../lib/prisma.js';

const MASTER_IDS = ['units', 'enemies', 'items', 'equipment', 'quests'] as const;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  // ?type=images → 画像パス一覧
  if (req.query.type === 'images') {
    const images = await prisma.unitImage.findMany({
      where: { isAvailable: true },
      select: { unitId: true, rarity: true, imagePath: true },
      orderBy: [{ unitId: 'asc' }, { rarity: 'asc' }],
    });
    return res
      .status(200)
      .setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400')
      .json({ images });
  }

  // マスタデータ
  const rows = await prisma.masterData.findMany({
    where: { id: { in: [...MASTER_IDS] } },
    select: { id: true, payload: true, version: true, updatedAt: true },
  });
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.id] = { data: row.payload, version: row.version, updatedAt: row.updatedAt };
  }
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(result);
}
