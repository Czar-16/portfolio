# First-visit intro verification

Verified against a production build on the local Linux environment on 2026-11-06. Development mode was used separately to check React Strict Mode, not to measure performance.

## Behavior

The `czar-portfolio-intro-v1` localStorage entry contains `{ completed: true, color, motion }`. Completion is written after an explicit launch's exit finishes. It never expires. Clearing browser storage resets the first-visit behavior; unavailable storage uses memory for the current application lifetime. Music is never saved and defaults on for each new dialog, with playback attempted only after launch.

Returning visits restore the motion choice before first paint and skip the dialog, music, and tour. Replay intro sits beneath the closing quote, restarts the boot sequence, and restores color and motion choices within the dialog. The chosen terminal color does not change website buttons, backgrounds, or theme accents. Each explicit launch preserves pathname, query, and history state, removes the hash, releases the intro lock, and resets native scrolling and Lenis to zero before swarm preparation. Ordinary return visits retain hashes and normal restoration.

## Checks

- `npm run lint`, `npm run typecheck`, and `npm run build`: passed.
- Saved browser regression suite: 4 tests passed in each of Chromium, Firefox, and WebKit (12 total). Covers first visit, Tab/Shift+Tab containment, shortcut blocking, every music/motion combination, saved choices, repeated replay, hash/history preservation, refresh, new tab, return navigation, corrupt/denied storage, absent canvas, and API failure responses.
- Additional browser checks passed for reduced motion, unavailable audio, volume/mute controls, callback/write count under repeated activation, boot skipping, and ready/launch/exit progression.
- Viewport checks passed at 320, 375, 390, 768, 1366, and 1920px, plus 844 × 390 landscape, in all three engines. Checked reachable launch controls and document overflow, including 120% CSS zoom at 320px.
- Separate desktop and touch-emulation checks passed for navigation, command palette, companion picker, theme/background controls, project/résumé link destinations, terminal `help`/`whoami`, and return navigation. The résumé points to Google Drive; its remote availability was not asserted.
- Strict Mode launch/replay/cleanup passed against the development server.
- Canvas drawing stopped and resumed when blocked and when document visibility was changed in the test harness; skip removed all pending reveal masks. Verified swarm canvas ratio caps of 1.5 on a desktop context with DPR 2 and 1 on a touch context with DPR 3.

## Production samples

Desktop: headless Chromium, 1366 × 900, default particles background, music disabled, boot skipped, then launch and approximately 13 seconds of observation. Frame statistics below exclude the first two seconds after navigation. The final sample ran without the other browser test suites.

| Measurement | Before | After |
| --- | ---: | ---: |
| Median frame interval | 16.7ms | 16.7ms |
| 95th percentile frame interval | 16.8ms | 16.8ms |
| Frame intervals over 50ms | 6 | 0 |
| Main-thread tasks over 50ms | 1 (75ms) | 0 |

This sample is consistent with approximately 60fps; frame intervals and main-thread tasks do not establish GPU paint cost or performance on other hardware. The baseline task was not attributed to a particular function.

Mobile emulation: Chromium, 390 × 844, touch input, DPR 3, 4× CPU throttling. During a ten-second active swarm sample the median interval was 16.7ms, the 95th percentile 16.8ms, the maximum 33.4ms, and no main-thread task exceeded 50ms. **Launch/preparation still recorded tasks of 165ms, 64ms, and 62ms.** The automated skip click completed in 288ms, including Playwright overhead; this is not a direct input-to-paint latency measurement.

## Repeating the regression suite

The suite uses Playwright tooling already available in the verification environment; no dependency or backend changes were made. Supply Playwright and its browser binaries externally if they are not installed locally. With the production server running:

```sh
BASE_URL=http://localhost:3000 node --test tests/intro-browser.mjs
BASE_URL=http://localhost:3000 BROWSER=firefox node --test tests/intro-browser.mjs
BASE_URL=http://localhost:3000 BROWSER=webkit node --test tests/intro-browser.mjs
```

`WEBKIT_EXECUTABLE_PATH` can point to a locally configured WebKit launcher when required by Linux system-library availability.

## Coverage limits

No physical phones/tablets, Safari on Apple hardware, native browser-UI zoom, or physical audio output were tested. CSS zoom, touch/CPU emulation, and simulated document visibility do not replace those checks. Remaining mobile launch tasks warrant profiling on target devices; these observations do not promise identical frame rates or input latency on every device.
