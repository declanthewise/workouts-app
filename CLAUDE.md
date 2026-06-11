# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally

There are no tests, linter, or type checker configured.

## Architecture

Homebody is a single-page Vite + React 18 app for tracking progress through the r/bodyweightfitness Recommended Routine. Everything renders from one component tree with no routing and no backend. There are three views toggled by `App.jsx`'s `view` state (`home` / `about` / `gym`), not a router. State (`activeLevels`, `owned` equipment) lives in `App.jsx` and is persisted to `localStorage` under the `homebody.*` keys.

### Data model (`src/data/trees.js`)

`TREES` is the single source of truth: an ordered array of nine progressions. The order matters — `App.jsx` injects section captions at fixed indices (0 → "First Pair", 2 → "Second Pair", 4 → "Third Pair", 6 → "Core Triplet"). If you reorder or add/remove trees, update those indices. Each tree has `id`, `name`, `color` (accent for the selected tile), and `nodes` (exercises from easiest to hardest). A node may carry an optional `equipment` requirement (see below).

### Equipment gating (`src/data/equipment.js`)

`EQUIPMENT` is the registry of apartment-friendly gear (bar, rings, parallettes, band, ab wheel, weight). The set the user confirms owning lives in `App.jsx`'s `owned` state. A node's `equipment` is **CNF**: an array of groups where each group is satisfied if the user owns *any* item in it, and the node unlocks only when *every* group is satisfied — so `[["bar","rings"]]` means "bar or rings" and `[["bar"],["band"]]` means "bar and band". A node with no `equipment` is bodyweight and always available. `nodeUnlocked(node, owned)` is the gate.

`App.jsx` clamps every row's selected level to an unlocked tile whenever `owned` changes (`clampLevels`); a row with no unlocked tile at all gets level `null` (it still renders all tiles, just none selected). Downstream: `ProgressionRow` always renders every tile (locked ones grayed but legible). All tiles are scroll-snap targets so locked tiles can be centered for visibility; the chevrons step one tile at a time across the whole row (tracked by `centered` state), but only an *unlocked* centered tile becomes the selected level. A locked tile shows a `+` button where the selected tile's `⋯` (instructions) sits; tapping it opens `EquipmentPrompt`. The prompt asks only about gear the user doesn't already own (`unmetGroups`); the question folds in the movement name and adapts to the requirement shape ("For X, do you have access to a:" / "…to either:" / "…to both:" — the article comes from `EQUIPMENT_ARTICLE` and only applies to the single-piece case) and each missing piece gets its own **Yes / Not yet** buttons. Answers are held locally and applied only once every piece has been answered (so an "either" lets the user confirm both), after a short `RESOLVE_DELAY` so the chosen button's color change is perceptible, at which point it calls `App.confirmEquipment(treeId, nodeIndex, node, yesIds)`. That adds the confirmed ids to `owned` and selects the tile only if they actually unlock it; partial confirmations still record the gear but leave the tile locked. Dismissing (overlay/Esc) applies nothing. `Workout` drops `null` rows from the session. `MyGym.jsx` is the central toggle page (reached from the header) and the only place to turn equipment back off.

### Layout contract (`src/App.jsx` + `src/components/ProgressionRow.jsx`)

The outer page never scrolls: `html`/`body` use `overflow: hidden` and `#root` is `100dvh`. On a tall viewport the nine `ProgressionRow`s share the vertical space and everything fits at once. On a short viewport (e.g. Chrome on iOS) rows hold a `ROW_MIN_H` of 72px (`flex: 1 0 72px`) and the rows container below the header scrolls internally — the header stays pinned. The invariant is "page never scrolls, only the rows column does"; adding page-level scroll breaks it.

Within a row, horizontal tile selection is driven by native scroll-snap (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`). On scroll, `ProgressionRow` finds the tile whose `offsetLeft` is closest to `scrollLeft` and calls `onLevelChange`. A trailing spacer (`flex: 0 0 calc(100% - TILE_W - 8px)`) is required so the last tile can snap to the left edge — removing it breaks selection of the final exercise. Tap on a tile calls `scrollIntoView({ inline: "start", behavior: "smooth" })` and the scroll handler updates state from there; state is never set directly from the click.

### Styling

All styles are inline `style={{}}` objects (plus two tiny `<style>` tags for `::-webkit-scrollbar` and global `body` rules). No CSS modules, Tailwind, or stylesheets. Fonts are loaded from Google Fonts via a `<link>` in `App.jsx` (DM Sans + Fraunces). The palette (`#faf8f4` bg, `#3a352e` text, muted accents per tree) is defined inline per component — keep it consistent if you touch visuals.
