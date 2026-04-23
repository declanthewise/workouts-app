# Homebody

A single-page app for tracking your place in the [r/bodyweightfitness Recommended Routine](https://www.reddit.com/r/bodyweightfitness/wiki/kb/recommended_routine/). Nine horizontally swipeable progression rows — three strength pairs and a core triplet — that fit the whole routine on one screen. Tap or swipe a row to mark where you are.

No accounts, no backend. Your place on each progression is kept in `localStorage`, so it persists across reloads on the same browser but doesn't sync across devices.

## Running it

```
npm install
npm run dev
```

`npm run build` produces a static bundle in `dist/`.

## Stack

Vite + React 18. All styling is inline. The nine progressions are hardcoded in `src/data/trees.js`.
