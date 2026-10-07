import test from 'node:test';
import assert from 'node:assert/strict';
import { isVisitorId, visitorKeys, registerVisitor, REGISTER_VISITOR_SCRIPT } from '../lib/visitor-store.mjs';
import { isVisitorRequestAllowed } from '../lib/visitor-request.mjs';

const visitorId = 'a2baf772-0153-49a1-8bda-268ba3d03f35';
const env = { UPSTASH_REDIS_REST_URL: 'https://example.upstash.io', UPSTASH_REDIS_REST_TOKEN: 'test-token' };

test('same-origin browser visits work when Netlify rewrites the request URL', () => {
  const request = new Request('http://internal.netlify/api/visitors', {
    headers: { origin: 'https://anoopbuilds.netlify.app', 'sec-fetch-site': 'same-origin' },
  });
  assert.equal(isVisitorRequestAllowed(request), true);
});

test('origin validation still rejects other sites and supports clients without fetch metadata', () => {
  const url = 'https://anoopbuilds.netlify.app/api/visitors';
  for (const headers of [
    { origin: 'https://other.example', 'sec-fetch-site': 'cross-site' },
    { origin: 'https://anoopbuilds.netlify.app', 'sec-fetch-site': 'cross-site' },
    { origin: 'https://other.example', 'sec-fetch-site': 'same-site' },
    { origin: 'https://other.example' },
    { origin: 'null' },
  ]) assert.equal(isVisitorRequestAllowed(new Request(url, { headers })), false);
  for (const headers of [{}, { origin: 'https://anoopbuilds.netlify.app' }]) {
    assert.equal(isVisitorRequestAllowed(new Request(url, { headers })), true);
  }
});

test('identifiers are validated and daily keys change precisely at UTC midnight', () => {
  assert.equal(isVisitorId(visitorId), true);
  for (const invalid of [null, '', 4, '../../total', visitorId + ':extra']) assert.equal(isVisitorId(invalid), false);
  const before = visitorKeys(visitorId, new Date('2026-10-07T23:59:59Z'));
  const after = visitorKeys(visitorId, new Date('2026-10-08T00:00:00Z'));
  assert.equal(before[0], after[0]);
  assert.notEqual(before[1], after[1]);
  assert.match(before[1], /2026-10-07/);
  assert.throws(() => visitorKeys('invalid'));
});

test('registration sends one authenticated atomic command and returns the shared total', async () => {
  let requests = 0;
  const count = await registerVisitor(visitorId, {
    env, now: new Date('2026-10-07T10:00:00Z'),
    fetch: async (url, init) => {
      requests++;
      assert.equal(url.href, 'https://example.upstash.io/');
      assert.equal(init.headers.Authorization, 'Bearer test-token');
      assert.equal(init.cache, 'no-store');
      assert.deepEqual(JSON.parse(init.body), ['EVAL', REGISTER_VISITOR_SCRIPT, 2, ...visitorKeys(visitorId, new Date('2026-10-07'))]);
      return Response.json({ result: 1234 });
    },
  });
  assert.equal(requests, 1);
  assert.equal(count, 1234);
});

test('configuration, upstream failures, and invalid counts fail instead of returning invented totals', async () => {
  await assert.rejects(registerVisitor(visitorId, { env: {} }));
  await assert.rejects(registerVisitor(visitorId, { env: { ...env, UPSTASH_REDIS_REST_URL: 'http://example.com' } }));
  for (const payload of [{ error: 'ERR' }, { result: null }, { result: -1 }, { result: 1.2 }, { result: '100' }]) {
    await assert.rejects(registerVisitor(visitorId, { env, fetch: async () => Response.json(payload) }));
  }
  await assert.rejects(registerVisitor(visitorId, { env, fetch: async () => new Response('', { status: 503 }) }));
  await assert.rejects(registerVisitor(visitorId, { env, fetch: async () => { throw new Error('Offline'); } }));
});
