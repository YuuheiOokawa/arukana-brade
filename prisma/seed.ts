import { PrismaClient } from '@prisma/client';
import { UNIT_MASTER } from '../src/data/units.js';
import { HERO_UNIT_MASTERS } from '../src/data/heroes.js';
import { ENEMY_MASTER } from '../src/data/enemies.js';
import { ITEM_MASTER } from '../src/data/items.js';
import { EQUIPMENT_MASTER } from '../src/data/equipments.js';
import { QUEST_WORLDS } from '../src/data/quests.js';
import { existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

// 存在する画像ファイルのみを登録
const RARITY_SUFFIXES: Record<number, string> = {
  1: '1', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: 'crown',
};
const UNIT_IDS = [
  'unit_001','unit_002','unit_003','unit_004','unit_005','unit_006',
  'unit_007','unit_008','unit_009','unit_010','unit_011','unit_012',
];

async function seedUnitImages() {
  const publicDir = join(process.cwd(), 'public');
  const entries: Array<{ unitId: string; rarity: number; imagePath: string }> = [];

  for (const unitId of UNIT_IDS) {
    for (const [rarityStr, suffix] of Object.entries(RARITY_SUFFIXES)) {
      const rarity = Number(rarityStr);
      const relPath = `/assets/images/characters/units/${unitId}/${unitId}_${suffix}.webp`;
      const absPath = join(publicDir, relPath.replace(/^\//, ''));
      if (existsSync(absPath)) {
        entries.push({ unitId, rarity, imagePath: relPath });
      }
    }
  }

  for (const entry of entries) {
    await prisma.unitImage.upsert({
      where: { unitId_rarity: { unitId: entry.unitId, rarity: entry.rarity } },
      update: { imagePath: entry.imagePath, isAvailable: true },
      create: { ...entry, isAvailable: true },
    });
  }
  console.log(`✅ unitImages seeded: ${entries.length} entries`);
}

async function main() {
  const allUnits = [...UNIT_MASTER, ...HERO_UNIT_MASTERS];

  const datasets: Array<{ id: string; payload: unknown }> = [
    { id: 'units',     payload: allUnits },
    { id: 'enemies',   payload: ENEMY_MASTER },
    { id: 'items',     payload: ITEM_MASTER },
    { id: 'equipment', payload: EQUIPMENT_MASTER },
    { id: 'quests',    payload: QUEST_WORLDS },
  ];

  for (const { id, payload } of datasets) {
    await prisma.masterData.upsert({
      where: { id },
      update: { payload: payload as object, version: { increment: 1 } },
      create: { id, payload: payload as object },
    });
    console.log(`✅ ${id} seeded`);
  }

  await seedUnitImages();

  console.log('🎉 All master data seeded successfully!');
}

main().catch(console.error).finally(() => void prisma.$disconnect());
