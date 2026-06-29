import { PrismaClient } from '@prisma/client';
import { UNIT_MASTER } from '../src/data/units.js';
import { HERO_UNIT_MASTERS } from '../src/data/heroes.js';
import { ENEMY_MASTER } from '../src/data/enemies.js';
import { ITEM_MASTER } from '../src/data/items.js';
import { EQUIPMENT_MASTER } from '../src/data/equipments.js';
import { QUEST_WORLDS } from '../src/data/quests.js';

const prisma = new PrismaClient();

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

  console.log('🎉 All master data seeded successfully!');
}

main().catch(console.error).finally(() => void prisma.$disconnect());
