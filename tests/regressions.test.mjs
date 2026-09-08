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
