import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
const memory = new Map();
Object.defineProperty(globalThis, 'localStorage', {value: { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v), removeItem: k => memory.delete(k) }, configurable:true});
globalThis.window = {localStorage:globalThis.localStorage};
const {usePartyStore} = await import('../src/stores/partyStore.ts');
const {usePlayerStore} = await import('../src/stores/playerStore.ts');
const {useUnitStore} = await import('../src/stores/unitStore.ts');
const {UNIT_MASTER} = await import('../src/data/units.ts');
const {getUnitImagePath, getCharacterArt, starRarityToImageRarity} = await import('../src/lib/unitImage.ts');
const {RANK_TITLES, getArenaFrameStyle, getRankProgressPct, getPointsToNextRank} = await import('../src/data/arenaRank.ts');
const {useEquipmentStore, EXP_PER_LEVEL} = await import('../src/stores/equipmentStore.ts');
const {useRaidStore, getDefaultRaidStates} = await import('../src/stores/raidStore.ts');
const {useQuestStore} = await import('../src/stores/questStore.ts');
const {resolvePlayableStage} = await import('../src/utils/stageResolver.ts');
const {characterAssets} = await import('../src/data/assets/characterAssets.ts');
const {RAID_BOSSES} = await import('../src/data/events.ts');
const {SUMMON_POOLS} = await import('../src/data/summons.ts');
const {PRESET_GUILDS} = await import('../src/stores/guildStore.ts');
const {GUILD_EMBLEMS, RAID_BOSS_MAX_HP, SUMMON_SERVER_RULES, UNIT_IDS_BY_RARITY, UNIT_RARITY_BY_ID, isValidArcanaPlayerId, toIntegerInRange} = await import('../lib/gameRules.ts');

test('Replacing or moving a party leader keeps the leader in a unique occupied slot', () => {
  const store = usePartyStore.getState();
  usePartyStore.setState({parties:[{id:'test',name:'test',slots:['a','b',null,null,null],leaderId:'a'}],activePartyId:'test'});
  store.setSlot('test',0,'c');
  assert.equal(store.getActiveParty().leaderId,'c');
  store.setSlot('test',3,'c');
  assert.equal(store.getActiveParty().slots.filter(x=>x==='c').length,1);
  assert.equal(store.getActiveParty().leaderId,'c');
  store.setLeader('test','outside');
  assert.equal(store.getActiveParty().leaderId,'c');
  store.removeUnitFromParties('c');
  assert.equal(store.getActiveParty().leaderId,'b');
  store.setSlot('test',-1,'bad'); store.setSlot('test',5,'bad');
  assert.equal(store.getActiveParty().slots.length,5);
  store.setActiveParty('missing');
  assert.equal(usePartyStore.getState().activePartyId,'test');
});

test('Negative and non-finite spending cannot mint currency or stamina', () => {
  const s=usePlayerStore.getState();
  usePlayerStore.setState({player:{...s.player,gold:100,diamond:100,stamina:10}});
  for (const amount of [-1,NaN,Infinity]) for(const spend of [s.spendGold,s.spendDiamond,s.spendStamina]) assert.equal(spend(amount),false);
  assert.equal(usePlayerStore.getState().player.gold,100);
  assert.equal(usePlayerStore.getState().player.diamond,100);
  assert.equal(usePlayerStore.getState().player.stamina,10);
  assert.equal(s.spendGold(101),false); assert.equal(s.spendGold(100),true);
  assert.equal(usePlayerStore.getState().player.gold,0);
});

test('Invalid and excessive reward additions cannot corrupt currency or EXP', () => {
  const before = structuredClone(usePlayerStore.getState().player);
  for (const amount of [-1, 0, NaN, Infinity]) {
    usePlayerStore.getState().addGold(amount);
    usePlayerStore.getState().addDiamond(amount);
    usePlayerStore.getState().addExp(amount);
  }
  assert.deepEqual(usePlayerStore.getState().player, before);
  usePlayerStore.setState({player:{...before,gold:999_999_998,diamond:999_998}});
  usePlayerStore.getState().addGold(100);
  usePlayerStore.getState().addDiamond(100);
  assert.equal(usePlayerStore.getState().player.gold,999_999_999);
  assert.equal(usePlayerStore.getState().player.diamond,999_999);
});

test('Invalid inventory quantities do not create or consume items', () => {
  usePlayerStore.setState({items:[{itemId:'item_exp_s',quantity:3}]});
  const s=usePlayerStore.getState();
  for(const n of [-1,0,0.5,NaN,Infinity]) {assert.equal(s.useItem('item_exp_s',n),false);s.addItem('item_exp_s',n);}
  assert.equal(usePlayerStore.getState().items[0].quantity,3);
  assert.equal(s.useItem('item_exp_s',4),false);
  assert.equal(s.useItem('item_exp_s',3),true);
  assert.equal(usePlayerStore.getState().items.length,0);
});

test('Rapid additions have distinct identities and invalid EXP preserves progression', () => {
  useUnitStore.setState({ownedUnits:[]});
  const s=useUnitStore.getState();
  const ids=Array.from({length:100},()=>s.addUnit('unit_001').instanceId);
  assert.equal(new Set(ids).size,100);
  const before=structuredClone(s.getUnit(ids[0]));
  for(const n of [-1,NaN,Infinity]) s.levelUpUnit(ids[0],n);
  assert.deepEqual(s.getUnit(ids[0]),before);
});

test('Every character has existing art at every rarity and valid clipping bounds', () => {
  for(const master of UNIT_MASTER) for(const rarity of [1,2,3,4,5,6,7,'CROWN']) {
    const src=getUnitImagePath(master.id,rarity);
    assert.ok(src,`${master.id} / ${rarity}`);
    assert.ok(existsSync('public'+src),src);
    const art=getCharacterArt(src,master.id);assert.ok(art);
    const [x,y,w,h]=art.crop;
    assert.ok(x>=0 && y>=0 && w>0 && h>0 && x+w<=art.width && y+h<=art.height,master.id);
  }
  assert.equal(starRarityToImageRarity('CROWN'),8);
  assert.equal(starRarityToImageRarity('unknown'),1);
  assert.equal(getUnitImagePath('unknown',1),null);
  const generated=JSON.parse(readFileSync('src/data/generated-character-art.json','utf8'));
  assert.equal(Object.keys(generated).length,100);
});

test('Arena prestige styles and progress remain correct from entry to ARCANA', () => {
  const entry = getArenaFrameStyle(0);
  const apexThreshold = RANK_TITLES[0].min;
  const apex = getArenaFrameStyle(apexThreshold);
  assert.equal(entry.tier, 0);
  assert.equal(entry.rainbow, false);
  assert.equal(apex.tier, 10);
  assert.equal(apex.prestige, 'ARCANA');
  assert.equal(apex.rainbow, true);
  assert.equal(getRankProgressPct(apexThreshold), 100);
  assert.equal(getPointsToNextRank(apexThreshold), null);
  assert.ok(getRankProgressPct(50) > 0 && getRankProgressPct(50) < 100);
  assert.equal(getPointsToNextRank(50), 50);
});

test('Equipment enhancement consumes large EXP across levels and rejects invalid input', () => {
  useEquipmentStore.setState({ownedEquipments:[]});
  assert.equal(useEquipmentStore.getState().addEquipment('missing'), '');
  const id = useEquipmentStore.getState().addEquipment('equip_sword_iron');
  assert.ok(id);
  const needed = EXP_PER_LEVEL(1) + EXP_PER_LEVEL(2) + 1;
  useEquipmentStore.getState().levelUpEquipment(id, needed);
  assert.equal(useEquipmentStore.getState().ownedEquipments[0].level, 3);
  const snapshot = structuredClone(useEquipmentStore.getState().ownedEquipments[0]);
  useEquipmentStore.getState().levelUpEquipment(id, -1);
  useEquipmentStore.getState().levelUpEquipmentBy(id, -2);
  assert.deepEqual(useEquipmentStore.getState().ownedEquipments[0], snapshot);
});

test('Raid damage cannot heal a boss and overkill is clamped', () => {
  const defaults = getDefaultRaidStates();
  useRaidStore.setState({raidStates:defaults});
  const boss = defaults[0];
  const before = structuredClone(useRaidStore.getState().raidStates);
  assert.deepEqual(useRaidStore.getState().dealDamage(boss.bossId, -100), []);
  assert.deepEqual(useRaidStore.getState().raidStates, before);
  useRaidStore.getState().dealDamage(boss.bossId, boss.currentHp + 1000);
  const after = useRaidStore.getState().raidStates.find(r=>r.bossId===boss.bossId);
  assert.equal(after.currentHp, 0);
  assert.equal(after.totalDamageDealt, boss.currentHp);
});

test('Every playable stage type resolves and star ratings stay within 1-3', () => {
  assert.ok(resolvePlayableStage('stage_1_1_1'));
  assert.ok(resolvePlayableStage('event_dark_1'));
  assert.ok(resolvePlayableStage('raid_raid_dark_lord_stage'));
  useQuestStore.setState({stageStars:{}});
  useQuestStore.getState().recordStars('stage_1_1_1', 99);
  assert.equal(useQuestStore.getState().getStars('stage_1_1_1'), 3);
  useQuestStore.getState().recordStars('stage_1_1_2', NaN);
  assert.equal(useQuestStore.getState().getStars('stage_1_1_2'), 0);
});

test('Every character asset in the central manifest is adopted and exists', () => {
  for (const asset of Object.values(characterAssets)) {
    assert.equal(asset.status, 'adopted', asset.id);
    assert.ok(existsSync(`public${asset.path}`), asset.path);
  }
});

test('Shared server rules match every unit, summon pool, raid boss, and guild emblem', () => {
  const catalogIds = Object.values(UNIT_IDS_BY_RARITY).flat();
  assert.equal(catalogIds.length, 150);
  assert.equal(new Set(catalogIds).size, 150);
  for (const unit of UNIT_MASTER) assert.equal(UNIT_RARITY_BY_ID.get(unit.id), unit.rarity, unit.id);
  for (const pool of SUMMON_POOLS) {
    const rule = SUMMON_SERVER_RULES[pool.id];
    assert.ok(rule, pool.id);
    assert.equal(rule.cost1, pool.cost1);
    assert.equal(rule.cost10, pool.cost10);
    for (const rate of pool.rates) {
      for (const unitId of rate.unitIds) assert.equal(UNIT_RARITY_BY_ID.get(unitId), rate.rarity, `${pool.id}/${unitId}`);
    }
  }
  for (const boss of RAID_BOSSES) assert.equal(RAID_BOSS_MAX_HP[boss.id], boss.totalHp, boss.id);
  for (const guild of PRESET_GUILDS) assert.ok(GUILD_EMBLEMS.includes(guild.emblem), guild.id);
});

test('External integer and player ID validators reject ambiguous input', () => {
  assert.equal(toIntegerInRange(3, 1, 10), 3);
  assert.equal(toIntegerInRange('3', 1, 10), 3);
  for (const value of [0, 1.5, NaN, Infinity, 11, 'oops']) assert.equal(toIntegerInRange(value, 1, 10), null);
  assert.equal(isValidArcanaPlayerId('ARC-MTTKI3WL'), true);
  assert.equal(isValidArcanaPlayerId('arc-MTTKI3WL'), false);
  assert.equal(isValidArcanaPlayerId('ARC-../../'), false);
});
