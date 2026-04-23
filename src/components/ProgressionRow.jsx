import { useRef, useEffect } from "react";

const TILE_W = 190;
const TILE_MIN_H = 52;

// Green → amber → red scale used to tint the difficulty badge on non-selected tiles.
const DIFF_SCALE = [
  "#4caf50", "#7ab040", "#a0b830", "#c4a833",
  "#e09b30", "#f57c42", "#e65a35", "#e04040", "#b82a2a",
];
const diffColorFor = (i, total) => {
  if (total <= 1) return DIFF_SCALE[0];
  const t = i / (total - 1);
  return DIFF_SCALE[Math.round(t * (DIFF_SCALE.length - 1))];
};

function DiffBadge({ diff, color, filled }) {
  return (
    <svg width={18} height={18} viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
      <circle cx={9} cy={9} r={8} fill={filled ? "rgba(255,255,255,0.22)" : color} />
      <text
        x={9} y={9.5}
        textAnchor="middle" dominantBaseline="central"
        fontSize={9} fontWeight={700} fill="#fff"
      >
        {diff}
      </text>
    </svg>
  );
}

export default function ProgressionRow({ tree, activeLevel, onLevelChange }) {
  const scrollerRef = useRef(null);
  const tileRefs = useRef([]);
  const rafRef = useRef(null);
  const total = tree.nodes.length;

  // On mount, line up the initial active tile in the center without animation.
  useEffect(() => {
    const tile = tileRefs.current[activeLevel];
    if (tile) tile.scrollIntoView({ inline: "center", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const center = scroller.scrollLeft + scroller.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const tileCenter = tile.offsetLeft + tile.offsetWidth / 2;
        const dist = Math.abs(tileCenter - center);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      if (closest !== activeLevel) onLevelChange(tree.id, closest);
    });
  };

  return (
    <>
      <style>{`.tile-scroller::-webkit-scrollbar { display: none; }`}</style>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="tile-scroller"
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          alignItems: "stretch",
          gap: "8px",
          overflowX: "auto",
          overflowY: "hidden",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
          paddingTop: "3px",
          paddingBottom: "4px",
        }}
      >
        {/* Spacers let the first and last tiles snap to the horizontal center. */}
        <div style={{ flex: `0 0 calc(50% - ${TILE_W / 2}px)` }} aria-hidden />
        {tree.nodes.map((ex, i) => {
          const isSelected = i === activeLevel;
          const diffColor = diffColorFor(i, total);
          return (
            <button
              key={i}
              ref={(el) => (tileRefs.current[i] = el)}
              onClick={(e) => {
                e.currentTarget.scrollIntoView({
                  inline: "center", block: "nearest", behavior: "smooth",
                });
              }}
              style={{
                flex: `0 0 ${TILE_W}px`,
                height: "100%",
                minHeight: `${TILE_MIN_H}px`,
                padding: "8px 48px 8px 14px",
                borderRadius: "12px",
                background: isSelected ? tree.color : "#fff",
                color: isSelected ? "#fff" : "#5a554e",
                border: isSelected ? "1px solid transparent" : "1px solid #ece6dc",
                boxShadow: isSelected ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "10px",
                fontFamily: "'DM Sans', sans-serif",
                scrollSnapAlign: "center",
                cursor: "pointer",
                position: "relative",
                transition: "background 0.18s ease, color 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease",
              }}
            >
              <DiffBadge diff={i + 1} color={diffColor} filled={isSelected} />
              <span style={{
                fontSize: "12.5px",
                fontWeight: 500,
                textAlign: "left",
                lineHeight: 1.2,
                flex: 1,
                minWidth: 0,
              }}>
                {ex.name}
              </span>
              {isSelected && (
                <span style={{
                  position: "absolute",
                  top: 5,
                  right: 10,
                  fontSize: "9.5px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  color: "rgba(255,255,255,0.85)",
                  whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}>
                  {tree.name}
                </span>
              )}
            </button>
          );
        })}
        <div style={{ flex: `0 0 calc(50% - ${TILE_W / 2}px)` }} aria-hidden />
      </div>
    </>
  );
}
