This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Visitor counter

The homepage ends with a glowing blue eye and a shared visitor count. The eye
blinks every five seconds, pauses in hidden tabs, and stays open for reduced
motion. Visits anywhere on the portfolio count, even without scrolling down.

Create a persistent Upstash Redis database and configure these server-only
environment variables in your production deployment:

```dotenv
UPSTASH_REDIS_REST_URL=https://YOUR-DATABASE.upstash.io
UPSTASH_REDIS_REST_TOKEN=YOUR-WRITE-TOKEN
```

Use the regular write token, not the read-only token. Redeploy after adding
the variables. No Redis schema setup is needed; the total starts at zero on
the first production visit. Keep this database dedicated to this portfolio.
The total key is `portfolio:{visitors}:total` and has no expiry. Configure the
database with no eviction so the total and deduplication keys are retained.

An anonymous browser UUID is saved in local storage. An atomic Redis script
counts that UUID once per UTC calendar day, with temporary deduplication keys
expiring after 48 hours. This is cumulative daily browser visits, not lifetime
unique people. Clearing storage or switching browsers counts separately.
If local storage is blocked, the identifier lasts only for the current page
session. No IP addresses or browser fingerprints are collected.

Development, browser-test builds, and Vercel preview deployments do not change
the production count. Missing credentials or storage errors show “Visitor
count unavailable”; no placeholder total is invented. The counter is approximate
and is not intended to resist visitors deliberately generating new identifiers.

Run `npm run test:visitors` for storage tests and
`npx playwright test tests/browser/visitors.spec.ts` after `npm run build:e2e`
for browser checks. Before release, verify with the configured database that
refreshing and concurrent requests for one UUID count once, and another UUID
increments the total. Use a separate database for that smoke test.

## Verification

```bash
npm run lint
npm run typecheck
npm run test:x
npx playwright install --with-deps chromium firefox webkit
npm run test:e2e
```

The browser suite builds the production app into `.next-test`, starts it on port
3100, and checks all seven page types in Chromium, Firefox, and WebKit. The
separate build directory allows the development server to keep running.

Coverage includes 320–1920px widths and breakpoint boundaries, both themes,
short landscape layouts, touch and keyboard interactions, reduced motion,
external-content failure and timeout states, and 200% zoom-equivalent reflow.
Native browser zoom is not exposed by Playwright, so the zoom check uses the
corresponding CSS viewport and pixel density. External responses are stubbed
for repeatability; live service availability is not asserted.

Screenshots for visual review are written to `test-results/review`; the HTML
report and failure traces are available through `npx playwright show-report`.
