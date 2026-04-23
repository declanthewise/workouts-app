# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally

There are no tests, linter, or type checker configured.

## Architecture

Homebody is a single-page Vite + React 18 app for tracking progress through the r/bodyweightfitness Recommended Routine. Everything renders from one component tree with no routing, no backend, and no persistence — `activeLevels` lives in `App.jsx` state only.

### Data model (`src/data/trees.js`)

`TREES` is the single source of truth: an ordered array of nine progressions. The order matters — `App.jsx` injects section captions at fixed indices (0 → "First Pair", 2 → "Second Pair", 4 → "Third Pair", 6 → "Core Triplet"). If you reorder or add/remove trees, update those indices. Each tree has `id`, `name`, `color` (accent for the selected tile), and `nodes` (exercises from easiest to hardest).

### Layout contract (`src/App.jsx` + `src/components/ProgressionRow.jsx`)

The outer page never scrolls: `html`/`body` use `overflow: hidden` and `#root` is `100dvh`. On a tall viewport the nine `ProgressionRow`s share the vertical space and everything fits at once. On a short viewport (e.g. Chrome on iOS) rows hold a `ROW_MIN_H` of 72px (`flex: 1 0 72px`) and the rows container below the header scrolls internally — the header stays pinned. The invariant is "page never scrolls, only the rows column does"; adding page-level scroll breaks it.

Within a row, horizontal tile selection is driven by native scroll-snap (`scroll-snap-type: x mandatory`, `scroll-snap-align: start`). On scroll, `ProgressionRow` finds the tile whose `offsetLeft` is closest to `scrollLeft` and calls `onLevelChange`. A trailing spacer (`flex: 0 0 calc(100% - TILE_W - 8px)`) is required so the last tile can snap to the left edge — removing it breaks selection of the final exercise. Tap on a tile calls `scrollIntoView({ inline: "start", behavior: "smooth" })` and the scroll handler updates state from there; state is never set directly from the click.

### Styling

All styles are inline `style={{}}` objects (plus two tiny `<style>` tags for `::-webkit-scrollbar` and global `body` rules). No CSS modules, Tailwind, or stylesheets. Fonts are loaded from Google Fonts via a `<link>` in `App.jsx` (DM Sans + Fraunces). The palette (`#faf8f4` bg, `#3a352e` text, muted accents per tree) is defined inline per component — keep it consistent if you touch visuals.
