/**
 * GET /api/master/images
 * UnitImage テーブルから全キャラ画像パスを返す
 * フロントエンドはこのデータをキャッシュして resolveUnitImage() に利用する
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { prisma } from '../../lib/prisma.js';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  if (_req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

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
