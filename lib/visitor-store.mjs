/** Server only: Upstash credentials must never reach the browser. */
export const REGISTER_VISITOR_SCRIPT = `
local total = tonumber(redis.call('GET', KEYS[1]) or '0')
if redis.call('SET', KEYS[2], '1', 'NX', 'EX', 172800) then
  total = redis.call('INCR', KEYS[1])
end
return total
`;

export function isVisitorId(value) {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function visitorKeys(visitorId, now = new Date()) {
  if (!isVisitorId(visitorId)) throw new Error('Invalid visitor identifier');
  return ['portfolio:{visitors}:total', `portfolio:{visitors}:seen:${now.toISOString().slice(0, 10)}:${visitorId}`];
}

export async function registerVisitor(visitorId, options = {}) {
  const env = options.env ?? process.env;
  const url = env.UPSTASH_REDIS_REST_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Visitor storage is not configured');
  const endpoint = new URL(url);
  if (endpoint.protocol !== 'https:') throw new Error('Visitor storage requires HTTPS');
  const keys = visitorKeys(visitorId, options.now);
  const response = await (options.fetch ?? fetch)(endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['EVAL', REGISTER_VISITOR_SCRIPT, keys.length, ...keys]),
    cache: 'no-store',
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Visitor storage request failed');
  const payload = await response.json();
  if (payload.error || !Number.isSafeInteger(payload.result) || payload.result < 0) {
    throw new Error('Invalid visitor storage response');
  }
  return payload.result;
}
