import { useRef, useEffect } from "react";

const TILE_W = 190;
const TILE_MIN_H = 52;
const LABEL_W = 84;
const ROW_MIN_H = 72;

export default function ProgressionRow({ tree, activeLevel, onLevelChange }) {
  const scrollerRef = useRef(null);
  const tileRefs = useRef([]);
  const rafRef = useRef(null);

  // On mount, line up the initial active tile at the left without animation.
  useEffect(() => {
    const tile = tileRefs.current[activeLevel];
    if (tile) tile.scrollIntoView({ inline: "start", block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const scrollerLeft = scroller.getBoundingClientRect().left;
      let closest = 0;
      let closestDist = Infinity;
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const dist = Math.abs(tile.getBoundingClientRect().left - scrollerLeft);
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
      }}>
        <div style={{
          flex: `0 0 ${LABEL_W}px`,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingLeft: "16px",
          paddingRight: "10px",
          fontFamily: "'Fraunces', serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "#6b6358",
          lineHeight: 1.15,
          textAlign: "right",
        }}>
          {tree.name}
        </div>
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
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingTop: "5px",
            paddingBottom: "5px",
            maskImage: "linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 0, black calc(100% - 28px), transparent 100%)",
          }}
        >
          {tree.nodes.map((ex, i) => {
            const isSelected = i === activeLevel;
            return (
              <button
                key={i}
                ref={(el) => (tileRefs.current[i] = el)}
                onClick={(e) => {
                  e.currentTarget.scrollIntoView({
                    inline: "start", block: "nearest", behavior: "smooth",
                  });
                }}
                style={{
                  flex: `0 0 ${TILE_W}px`,
                  height: "100%",
                  minHeight: `${TILE_MIN_H}px`,
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
                  scrollSnapAlign: "start",
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
                }}>
                  {ex.name}
                </span>
              </button>
            );
          })}
          {/* Trailing spacer lets the last tile snap to the left edge. */}
          <div style={{ flex: `0 0 calc(100% - ${TILE_W + 8}px)` }} aria-hidden />
        </div>
      </div>
    </>
  );
}
