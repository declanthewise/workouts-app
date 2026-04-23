import { useRef, useEffect } from "react";

const TILE_W = 190;
const TILE_MIN_H = 52;
const LABEL_W = 84;
const ROW_MIN_H = 72;
const RIGHT_FADE = 76;
// Tiles center in the space *to the right of the name*. Leading/trailing spacers
// size themselves against the scroller width so tile[0] can reach center when
// scrollLeft=0 and tile[last] can reach it at max scroll.
const LEADING_SPACER = `calc((100% - ${TILE_W - LABEL_W + 16}px) / 2)`;
const TRAILING_SPACER = `calc((100% - ${TILE_W + LABEL_W + 16}px) / 2)`;

// Left edge: fully transparent through the name area so the previous tile never
// shows under the row name; then a short ramp to opaque. Right edge: soft multi-stop fade.
const EDGE_FADE_MASK = `linear-gradient(to right, ` +
  `rgba(0,0,0,0) 0, ` +
  `rgba(0,0,0,0) ${LABEL_W}px, ` +
  `rgba(0,0,0,1) ${LABEL_W + 8}px, ` +
  `rgba(0,0,0,1) calc(100% - ${RIGHT_FADE}px), ` +
  `rgba(0,0,0,0.55) calc(100% - ${RIGHT_FADE - 8}px), ` +
  `rgba(0,0,0,0.18) calc(100% - ${RIGHT_FADE / 2}px), ` +
  `rgba(0,0,0,0) 100%)`;

export default function ProgressionRow({ tree, activeLevel, onLevelChange, onOpenInstructions }) {
  const scrollerRef = useRef(null);
  const tileRefs = useRef([]);
  const rafRef = useRef(null);

  // On mount, center the initial active tile in the padded snap area (the
  // region to the right of the name overlay). Set scrollLeft directly rather
  // than scrollIntoView so we never perturb the vertical scroll position of
  // the rows column above us.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tile = tileRefs.current[activeLevel];
    if (!scroller || !tile) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const targetTileLeft = scrollerRect.left + (LABEL_W + scrollerRect.width - TILE_W) / 2;
    scroller.scrollLeft += tile.getBoundingClientRect().left - targetTileLeft;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const scrollerRect = scroller.getBoundingClientRect();
      const paddedCenter = scrollerRect.left + (LABEL_W + scrollerRect.width) / 2;
      let closest = 0;
      let closestDist = Infinity;
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const rect = tile.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - paddedCenter);
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
      <div style={{
        flex: `1 0 ${ROW_MIN_H}px`,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
      }}>
        <div
          ref={scrollerRef}
          onScroll={handleScroll}
          className="tile-scroller"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "stretch",
            gap: "8px",
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollPaddingLeft: `${LABEL_W}px`,
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingTop: "5px",
            paddingBottom: "5px",
            maskImage: EDGE_FADE_MASK,
            WebkitMaskImage: EDGE_FADE_MASK,
          }}
        >
          {/* Leading spacer lets tile[0] reach the padded-center snap point at scrollLeft = 0. */}
          <div style={{ flex: `0 0 ${LEADING_SPACER}` }} aria-hidden />
          {tree.nodes.map((ex, i) => {
            const isSelected = i === activeLevel;
            return (
              <div
                key={i}
                ref={(el) => (tileRefs.current[i] = el)}
                style={{
                  position: "relative",
                  flex: `0 0 ${TILE_W}px`,
                  minHeight: `${TILE_MIN_H}px`,
                  scrollSnapAlign: "center",
                  display: "flex",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.currentTarget.scrollIntoView({
                      inline: "center", block: "nearest", behavior: "smooth",
                    });
                  }}
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "#fff",
                    color: "#3a352e",
                    border: "none",
                    boxShadow: isSelected
                      ? `inset 4px 0 0 ${tree.color}, 0 3px 8px rgba(40,30,20,0.10)`
                      : "0 1px 2px rgba(40,30,20,0.04)",
                    display: "flex",
                    alignItems: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "box-shadow 0.2s ease",
                  }}
                >
                  <span style={{
                    fontSize: "14px",
                    fontWeight: isSelected ? 600 : 500,
                    lineHeight: 1.2,
                    minWidth: 0,
                    paddingRight: isSelected ? "24px" : 0,
                  }}>
                    {ex.name}
                  </span>
                </button>
                {isSelected && (
                  <button
                    type="button"
                    aria-label={`How to do ${ex.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInstructions(ex);
                    }}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "4px",
                      padding: "4px 8px",
                      background: "none",
                      border: "none",
                      color: tree.color,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "18px",
                      fontWeight: 700,
                      lineHeight: 1,
                      letterSpacing: "1px",
                    }}
                  >
                    ⋯
                  </button>
                )}
              </div>
            );
          })}
          {/* Trailing spacer lets tile[last] reach the padded-center snap point at max scroll. */}
          <div style={{ flex: `0 0 ${TRAILING_SPACER}` }} aria-hidden />
        </div>
        <div style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: `${LABEL_W}px`,
          display: "flex",
          alignItems: "center",
          paddingLeft: "16px",
          fontFamily: "'Fraunces', serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "#6b6358",
          lineHeight: 1.15,
          pointerEvents: "none",
          zIndex: 1,
        }}>
          {tree.name}
        </div>
      </div>
    </>
  );
}
