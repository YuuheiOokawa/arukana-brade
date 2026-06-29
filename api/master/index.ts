/**
 * GET /api/master
 * マスタデータ（units/enemies/items/equipment/quests）をDBから返す。
 * DBに未登録の場合は空オブジェクトを返す（フロントはTypeScriptデータにフォールバック）。
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';

const MASTER_IDS = ['units', 'enemies', 'items', 'equipment', 'quests'] as const;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const rows = await prisma.masterData.findMany({
    where: { id: { in: [...MASTER_IDS] } },
    select: { id: true, payload: true, version: true, updatedAt: true },
  });

  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[row.id] = { data: row.payload, version: row.version, updatedAt: row.updatedAt };
  }

  // 60秒キャッシュ（Vercel Edge Cache）
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  return res.status(200).json(result);
}
