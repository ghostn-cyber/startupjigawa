import test from 'node:test';
import assert from 'node:assert/strict';

import { smokeCheck } from '../controllers/health.controller';

test('service smoke check reports database and redis status', async () => {
  const status = await smokeCheck();

  assert.ok(status.timestamp);
  assert.equal(typeof status.database, 'boolean');
  assert.equal(typeof status.redis, 'boolean');
});
