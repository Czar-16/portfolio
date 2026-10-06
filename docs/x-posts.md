# Selected X posts

The homepage rotates through exactly the owner's 24 selected posts. The approved IDs and their order live in `data/x-post-selection.ts`; real public post content is bundled in `data/x-posts.json`. The first listed post appears first, followed by a shuffled queue. Each post appears once per cycle before reshuffling, without consecutive repeats across cycles. There is no engagement ranking or 12-post limit.

The browser fetches `/api/x-posts` once per mount with `cache: "no-store"`. The endpoint returns the fixed selected collection; it does not scrape the profile, add new posts, or read/write a database. Existing `XPost` and `XFeed` response shapes are preserved, with `source: "saved"`, `refreshedAt: null`, and `persistence: "unconfigured"`. Updating the selection requires updating the two data files and deploying them.

Rotation runs locally every six seconds using the existing 350ms fade-and-slide transition. It pauses on hover, keyboard focus, hidden tabs, and when offscreen. Reduced motion shows the first selected post without automatic rotation. There are no navigation buttons or visible counters. Images fill the existing 230px preview; text-only posts retain the same outer card dimensions. Post text and images link to the full post, and the footer links to the account.

## Offline and cache behavior

The browser uses `portfolio:x-posts:itsCzar16:selected:v2`, leaving old collected-post caches unused. All cached and fetched data is validated, deduplicated, and filtered against the selected IDs. The complete bundled collection fills missing records and supplies all 24 posts if fetching fails, even on a first visit with no cache. Unselected posts never enter the carousel.

The archive importer and Supabase utilities remain available for separate collection maintenance, but the homepage no longer consumes that collection. An archive import must not overwrite the curated snapshot without restoring the 24 approved records. No X credentials or Supabase configuration are required for this card.

## Checks

```sh
npm run test:x
npx tsc --noEmit
npx eslint components/x-posts-card.tsx lib/x-posts.ts data/x-post-selection.ts app/api/x-posts/route.ts tests/x-posts.test.mjs
npm run build
```
