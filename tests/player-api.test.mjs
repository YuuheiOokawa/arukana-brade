import test from 'node:test';
import assert from 'node:assert/strict';

// Isolate the handler from production credentials and databases.
process.env.JWT_SECRET = 'player-api-regression-test-only';
const storedPlayer = {
  playerId: 'test-player', userId: 'test-user', playerName: '勇者',
  gold: 100, diamond: 50, staminaRecoveryTime: 1788946517279n,
};
let writes = [];
globalThis.prisma = {
  player: {
    findUnique: async () => storedPlayer,
    update: async ({ data }) => {
      writes.push(data);
      return { ...storedPlayer, ...data };
    },
  },
};
const { default: handler, normalizeOwnedUnitReferences } = await import('../api/player.ts');
const { signToken } = await import('../lib/auth.ts');
const { isRetryableSaveStatus } = await import('../src/lib/syncService.ts');
const cookie = `arcana_session=${signToken({ userId: 'test-user', email: 'test@example.invalid' })}`;
async function request(body, authenticated = true) {
  const response = {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    // Match res.json's actual serialization instead of accepting arbitrary objects.
    json(value) { this.body = JSON.parse(JSON.stringify(value)); return this; },
  };
  await handler({ method: 'POST', headers: { cookie: authenticated ? cookie : undefined }, body }, response);
  return response;
}

for (const [action, data] of [['save', { playerName: '新しい名前' }], ['currency', { gold: 250, diamond: 75 }]]) {
  test(`${action} returns JSON after saving a player with a BigInt recovery timestamp`, async () => {
    writes = [];
    const response = await request({ action, ...data });
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.player.staminaRecoveryTime, 1788946517279);
    assert.equal(typeof response.body.player.staminaRecoveryTime, 'number');
    assert.equal(writes.length, 1);
    for (const [key, value] of Object.entries(data)) assert.equal(response.body.player[key], value);
    assert.equal(typeof storedPlayer.staminaRecoveryTime, 'bigint');
  });
}

test('invalid saves report a fixed rejection reason without writing or logging payloads', async t => {
  const warning = t.mock.method(console, 'warn', () => {});
  writes = [];
  for (const body of [null, [], { action: 'currency', gold: 'private-invalid-value' }, { action: 'private-unknown-action' }]) {
    const response = await request(body);
    assert.equal(response.statusCode, 400);
    assert.equal(typeof response.body.error, 'string');
  }
  assert.equal(writes.length, 0);
  assert.equal(warning.mock.calls.length, 4);
  assert.ok(!JSON.stringify(warning.mock.calls.map(c => c.arguments)).includes('private-'));
});

test('unauthenticated saves remain unauthorized and never write', async () => {
  writes = [];
  const response = await request({ action: 'currency', gold: 250 }, false);
  assert.equal(response.statusCode, 401);
  assert.equal(writes.length, 0);
});

test('stale unit references are healed without removing valid party members', () => {
  const result = normalizeOwnedUnitReferences(
    [
      { instanceId: 'eq-valid', masterId: 'equip_sword_iron', equippedTo: 'owned-1' },
      { instanceId: 'eq-stale', masterId: 'equip_sword_iron', equippedTo: 'removed' },
    ],
    [{ id: 'party', slots: ['owned-1', 'removed', 'owned-1', null], leaderId: 'removed' }],
    'removed',
    new Set(['owned-1']),
  );
  assert.equal(result.normalizedEquips[0].equippedTo, 'owned-1');
  assert.equal(result.normalizedEquips[1].equippedTo, null);
  assert.deepEqual(result.normalizedParties[0].slots, ['owned-1', null, null, null]);
  assert.equal(result.normalizedParties[0].leaderId, 'owned-1');
  assert.equal(result.favoriteUnitId, null);
});

test('only transient save failures are queued for retry', () => {
  for (const status of [400, 401, 403, 404, 413, 422]) assert.equal(isRetryableSaveStatus(status), false);
  for (const status of [408, 429, 500, 502, 503]) assert.equal(isRetryableSaveStatus(status), true);
});
