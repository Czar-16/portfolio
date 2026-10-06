import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SELECTED_X_POST_IDS } from "../data/x-post-selection.ts";
import { parsePublicXProfile, parseXArchive } from "../lib/x-profile-parser.mjs";
import { hasXPostStore, readStoredXPosts, persistXPosts } from "../lib/x-post-store.mjs";
import { isXPost, mergeXPosts, selectXPosts, shufflePostIds } from "../lib/x-posts.ts";

const user = { core: { screen_name: "itsCzar16", name: "Czar16" }, avatar: { image_url: "https://pbs.twimg.com/profile_images/avatar.jpg" }, privacy: { protected: false } };
const tweet = (id, changes = {}) => ({ __typename: "Tweet", rest_id: id, core: { user_results: { result: user } }, details: { full_text: `Post ${id}`, created_at_ms: 1720000000000 + Number(id) }, ...changes });
const profile = (...tweets) => `<script>const $R={}; ${tweets.map((value, index) => `$R[${index}]=${JSON.stringify(value)};`).join("")}</script>`;
const post = id => ({ id, text: `Post ${id}`, createdAt: `2026-10-0${id}T00:00:00.000Z`, url: `https://x.com/itsCzar16/status/${id}`, author: { name: "Czar16", handle: "itsCzar16" } });

test("public parsing selects authored posts and rejects replies/reposts/protected authors", () => {
  const quote = tweet("2", { quoted_status_result: { result: tweet("9", { core: { user_results: { result: { core: { screen_name: "other" } } } } }) } });
  const posts = parsePublicXProfile(profile(tweet("1"), quote,
    tweet("3", { details: { full_text: "Reply", created_at_ms: 1720000000000, in_reply_to_status_id_str: "1" } }),
    tweet("4", { retweeted_status_result: {} }),
    tweet("5", { core: { user_results: { result: { ...user, privacy: { protected: true } } } } }),
    tweet("6", { core: { user_results: { result: { core: { screen_name: "other" } } } } }),
  ));
  assert.deepEqual(posts.map(item => item.id), ["2", "1"]);
  assert.ok(posts.every(isXPost));
});

test("static X references resolve without executing calls, getters, or constructors", () => {
  delete globalThis.__xParserExecuted;
  const html = `<script>globalThis.__xParserExecuted=true; const $R={}; $R[1]=${JSON.stringify(user)}; $R[2]={__typename:"Tweet",rest_id:"7",core:{user_results:{result:$R[1]}},details:{full_text:"Safe &amp; readable",created_at_ms:1720000000000},malicious:(()=>{globalThis.__xParserExecuted=true})(),get getter(){globalThis.__xParserExecuted=true},other:new Function("globalThis.__xParserExecuted=true")};</script>`;
  const posts = parsePublicXProfile(html);
  assert.equal(posts[0].text, "Safe & readable");
  assert.equal(globalThis.__xParserExecuted, undefined);
});

test("missing/changing/oversized public bootstrap fails cleanly", () => {
  assert.throws(() => parsePublicXProfile("<html>Please sign in</html>"));
  assert.throws(() => parsePublicXProfile("x".repeat(3_000_001)));
  assert.throws(() => parsePublicXProfile('<script>$R[0]=not valid !!!</script>'));
});

test("archive import strips assignment, filters replies/reposts, preserves quotes and only public fields", () => {
  const records = [
    { tweet: { id_str: "1", full_text: "Original", created_at: "Tue Oct 06 12:00:00 +0000 2026", secret: "private", entities: { urls: [] } } },
    { tweet: { id_str: "2", full_text: "Quote", created_at: "Tue Oct 06 12:01:00 +0000 2026", quoted_status_id_str: "9" } },
    { tweet: { id_str: "3", full_text: "Reply", created_at: "Tue Oct 06 12:02:00 +0000 2026", in_reply_to_status_id_str: "1" } },
    { tweet: { id_str: "4", full_text: "RT @other: repost", created_at: "Tue Oct 06 12:03:00 +0000 2026" } },
  ];
  const posts = parseXArchive(`window.YTD.tweets.part0 = ${JSON.stringify(records)};`);
  assert.deepEqual(posts.map(item => item.id), ["2", "1"]);
  assert.equal(JSON.stringify(posts).includes("private"), false);
  assert.ok(posts.every(isXPost));
  assert.throws(() => parseXArchive('window.YTD.tweets.part0 = (()=>process.exit())()'));
});

test("feed validation and merge reject unsafe links, deduplicate, and keep the freshest payload", () => {
  assert.equal(isXPost({ ...post("1"), image: { url: "https://evil.example/image.png", alt: "bad" } }), false);
  const merged = mergeXPosts([post("1"),post("2")], [{ ...post("1"), text: "Edited" }]);
  assert.deepEqual(merged.map(item => item.id), ["2", "1"]);
  assert.equal(merged[1].text, "Edited");
});

test("shuffle visits every post exactly once and avoids boundary duplicates", () => {
  const ids = ["1", "2", "3", "4"];
  for (let i = 0; i < 100; i++) {
    const order = shufflePostIds(ids, "1");
    assert.notEqual(order[0], "1");
    assert.deepEqual([...order].sort(), ids);
  }
  assert.deepEqual(shufflePostIds([]), []);
  assert.deepEqual(shufflePostIds(["1"], "1"), ["1"]);
});

test("Supabase paginates reads and batches upserts with server-only headers", async () => {
  const oldFetch = globalThis.fetch;
  const oldUrl = process.env.SUPABASE_URL, oldKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-key";
  try {
    assert.equal(hasXPostStore(),true);
    const reads=[];
    globalThis.fetch = async (url, options) => {
      reads.push(url);
      assert.equal(options.cache,"no-store");
      assert.equal(options.headers.Authorization,"Bearer test-only-key");
      return Response.json(url.includes("offset=0") ? Array.from({length:1000},()=>({payload:post("1")})) : [{payload:post("2")}]);
    };
    assert.equal((await readStoredXPosts()).length,1001);
    assert.equal(reads.length,2);
    const batchSizes=[];
    globalThis.fetch = async (url, options) => {
      assert.equal(options.method,"POST");
      assert.ok(url.includes("on_conflict=id"));
      batchSizes.push(JSON.parse(options.body).length);
      return new Response(null,{status:201});
    };
    await persistXPosts(Array.from({length:401},()=>post("1")));
    assert.deepEqual(batchSizes,[200,200,1]);
    globalThis.fetch = async () => new Response(null,{status:503});
    await assert.rejects(readStoredXPosts());
    await assert.rejects(persistXPosts([post("1")]));
  } finally {
    globalThis.fetch=oldFetch;
    if(oldUrl===undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL=oldUrl;
    if(oldKey===undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;
  }
});

test("metrics normalize modern public counts and archive strings without inventing missing views", () => {
  const modern = parsePublicXProfile(profile(tweet("1", { counts: { favorite_count: 15 }, views: { count: "368" } })))[0];
  assert.deepEqual(modern.metrics, { likes: 15, views: 368 });
  const archived = parseXArchive(JSON.stringify([{ tweet: { id_str: "2", full_text: "Archive", created_at: "2026-10-06", favorite_count: "0" } }]))[0];
  assert.deepEqual(archived.metrics, { likes: 0 });
  const invalid = parsePublicXProfile(profile(tweet("3", { counts: { favorite_count: -1 }, views: { count: "1.5" } })))[0];
  assert.equal(invalid.metrics, undefined);
  for (const value of [-1, 1.5, "3", null, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.equal(isXPost({ ...post("1"), metrics: { likes: value } }), false);
    assert.equal(isXPost({ ...post("1"), metrics: { views: value } }), false);
  }
  assert.equal(isXPost({ ...post("1"), metrics: null }), false);
  assert.equal(isXPost({ ...post("1"), metrics: { likes: 0, views: 0 } }), true);
});

test("selection includes all 24 supplied posts, in order, without a ranking cap", () => {
  const snapshot = JSON.parse(readFileSync(new URL("../data/x-posts.json", import.meta.url), "utf8"));
  assert.equal(SELECTED_X_POST_IDS.length, 24);
  assert.equal(snapshot.length, 24);
  assert.equal(new Set(snapshot.map(item => item.id)).size, 24);
  assert.ok(snapshot.every(isXPost));
  assert.deepEqual(selectXPosts(snapshot, SELECTED_X_POST_IDS).map(item => item.id), [...SELECTED_X_POST_IDS]);
  assert.equal(snapshot[0].id, "2096970091237900456");
  assert.ok(snapshot.some(item => item.id === "2106705942318645395"));
  assert.ok(snapshot.some(item => item.id === "2107205646815019055"));
});

test("selected feed excludes unrelated cached posts and deduplicates without changing the selection order", () => {
  const selected = selectXPosts([post("3"), post("1"), { ...post("2"), metrics: { likes: 9999 } }, post("1")], ["1", "3", "1"]);
  assert.deepEqual(selected.map(item => item.id), ["1", "3"]);
  assert.deepEqual(selectXPosts([], ["1"]), []);
});

test("refreshes preserve missing metrics, update observed zero, and deduplicate before selection", () => {
  const merged = mergeXPosts([{ ...post("1"), metrics: { likes: 15, views: 100 } }], [{ ...post("1"), text: "Updated", metrics: { likes: 0 } }]);
  assert.equal(merged.length, 1);
  assert.deepEqual(merged[0].metrics, { likes: 0, views: 100 });
  assert.equal(merged[0].text, "Updated");
  assert.deepEqual(mergeXPosts(merged, [post("1")])[0].metrics, { likes: 0, views: 100 });
  assert.equal(selectXPosts([...merged, ...merged], ["1"]).length, 1);
});
