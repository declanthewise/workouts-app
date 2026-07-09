// Shared visual vocabulary. Components still declare their styles inline
// (see CLAUDE.md); this module only holds what several of them share.

// Accent color at a given alpha — used for tinted tile backgrounds, colored
// shadows, and the section-caption rules.
export function fade(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Tiny tiling SVG noise — layered over flat fills as a subtle paper grain.
// Keep the opacity low (it reads as texture, not pattern).
export const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

// Brand green (Start workout, toggles, confirm buttons) — matches the
// second-pair accent so the whole app stays in one family.
export const BRAND = "#6f9161";
export const BRAND_GRADIENT = "linear-gradient(180deg, #7da06c, #6f9161)";

// Destructive red (Stop workout button and its confirm) — brick-toned so it
// sits comfortably next to the terracotta accent.
export const STOP = "#b04a42";
export const STOP_GRADIENT = "linear-gradient(180deg, #c25a50, #b04a42)";
