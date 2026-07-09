---
name: verify
description: Build, launch, and drive Homebody in a headless browser to verify a change end-to-end.
---

# Verifying Homebody changes

Homebody is a browser SPA (Vite + React). Verification means driving it in a real browser, not running tests (there are none).

## Launch

```bash
npm run dev -- --port 5199 &   # Vite dev server
```

If 5199 is taken (e.g. a stale server), Vite silently falls back to the next port — check the startup log for the actual port so you don't drive old code.

## Drive

No Playwright in the repo, but the npx cache has it and system Chrome works as the browser (no browser download needed):

```js
// drive.mjs — run with plain `node drive.mjs` (NODE_PATH doesn't work for ESM; import by absolute path)
import { chromium } from "/Users/declanfitzsimons/.npm/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } }); // iPhone-ish; app is mobile-first
```

If that npx cache path is gone, `npx playwright --version` re-resolves it; find the new hash with `ls -d ~/.npm/_npx/*/node_modules/playwright`.

## Gotchas

- First visit shows the **Welcome overlay** — dismiss via the "Get started" button before anything else (other selectors will match header buttons behind it and time out). Or skip it by seeding `homebody.welcomed.v1 = "1"` via `page.addInitScript`.
- Fresh localStorage means **no equipment owned**: equipment-gated rows (Pull-up, Dip, Row, Anti-Rotation) are locked/dropped from workouts. Seed `homebody.equipment.v1` via `page.addInitScript` if a flow needs them.
- Useful accessible names: "Start workout", "Stop workout", `How to do <name>` (the circled-? instructions button), `Add equipment for <name>` (the `+` on locked tiles), tiles are `Done with set N of 3` / "Skip 10 seconds of rest". The stop-confirm dialog is `role=dialog` "Stop this workout?" with "Keep going" / "Stop" buttons.
- When spamming tiles to drive a full session, there is a **one-frame gap between phases** where neither the active tile nor the rest tile exists (React advances the phase in an effect). Retry a few times with a short wait instead of concluding the workout is done.
- Layout invariant to probe: `document.body.scrollHeight > window.innerHeight` must be false (page never scrolls; only the rows column does).

## Flows worth driving

The workout runs *inside* the home rows (no separate page):

1. Start workout → current-phase rows stay lit, other rows/captions dim to view-only; tapping the active tile logs a set and the tile becomes a rest countdown ring (tap = skip 10s).
2. The header's Start button becomes a red **Stop workout** button during a session. There is no pause; nav between views leaves the clock running.
3. Stop workout mid-session opens the **StopConfirm** dialog; "Keep going" / Escape / overlay tap dismiss it with the session intact, "Stop" ends the session. Once the workout is complete, Stop ends immediately with no dialog.
4. Row swipe/chevrons/`+` are inert during a session; the circled `?` still opens instructions.
5. Full session: spam the rest tile to skip rests; phases advance down the page; completion banner appears at the top of the rows with an End button.
6. Confirming Stop anytime → rows instantly back to normal, Start workout pill returns.
