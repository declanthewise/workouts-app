import { useRef, useEffect, useState } from "react";
import { nodeUnlocked } from "../data/equipment";

const TILE_W = 190;
const TILE_MIN_H = 52;
const LABEL_W = 84;
const ROW_MIN_H = 72;
// Gap between tiles. Wide enough that the right chevron (which sits just past
// the active tile) doesn't overlap the next tile.
const GAP = 32;
// Symmetric spacers center tile[0] and tile[last] in the viewport at the scroll extremes.
const SPACER = `calc(50% - ${TILE_W / 2 + GAP}px)`;

// Previous tiles fully hidden (alpha=0 up to just before the active tile).
// Active tile opaque. Past the active tile, fades so the next tile shows faded.
const EDGE_FADE_MASK = `linear-gradient(to right, ` +
  `rgba(0,0,0,0) 0, ` +
  `rgba(0,0,0,0) calc(50% - ${TILE_W / 2 + GAP}px), ` +
  `rgba(0,0,0,1) calc(50% - ${TILE_W / 2}px), ` +
  `rgba(0,0,0,1) calc(50% + ${TILE_W / 2}px), ` +
  `rgba(0,0,0,0.6) calc(50% + ${TILE_W / 2 + GAP}px), ` +
  `rgba(0,0,0,0) 100%)`;

export default function ProgressionRow({ tree, activeLevel, owned, onLevelChange, onOpenInstructions, onRequestEquipment }) {
  const scrollerRef = useRef(null);
  const tileRefs = useRef([]);
  const rafRef = useRef(null);
  // The tile currently in the center column (locked or not) — drives the chevrons,
  // which step one tile at a time so grayed tiles stay reachable.
  const [centered, setCentered] = useState(activeLevel ?? 0);

  const unlocked = tree.nodes.map((n) => nodeUnlocked(n, owned));

  // On mount, center the initial active tile in the viewport without animation.
  // Set scrollLeft directly rather than scrollIntoView so we never perturb the
  // vertical scroll position of the rows column above us.
  useEffect(() => {
    const scroller = scrollerRef.current;
    const tile = tileRefs.current[activeLevel];
    if (!scroller || !tile) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const targetTileLeft = scrollerRect.left + (scrollerRect.width - TILE_W) / 2;
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
      const scrollerCenter = scrollerRect.left + scrollerRect.width / 2;
      let closest = -1;
      let closestDist = Infinity;
      tileRefs.current.forEach((tile, i) => {
        if (!tile) return;
        const rect = tile.getBoundingClientRect();
        const dist = Math.abs(rect.left + rect.width / 2 - scrollerCenter);
        if (dist < closestDist) {
          closestDist = dist;
          closest = i;
        }
      });
      if (closest < 0) return;
      setCentered(closest);
      // Locked tiles can be centered for visibility, but only an unlocked tile
      // becomes the selected level.
      if (unlocked[closest] && closest !== activeLevel) {
        onLevelChange(tree.id, closest);
      }
    });
  };

  const stepTo = (level) => {
    const tile = tileRefs.current[level];
    if (!tile) return;
    tile.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  };

  // Chevrons step through every tile (including grayed ones) for visibility.
  const canGoPrev = centered > 0;
  const canGoNext = centered < tree.nodes.length - 1;

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
            gap: `${GAP}px`,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            paddingTop: "5px",
            paddingBottom: "5px",
            maskImage: EDGE_FADE_MASK,
            WebkitMaskImage: EDGE_FADE_MASK,
          }}
        >
          {/* Leading spacer lets tile[0] reach the viewport center at scrollLeft = 0. */}
          <div style={{ flex: `0 0 ${SPACER}` }} aria-hidden />
          {tree.nodes.map((ex, i) => {
            const isSelected = i === activeLevel;
            const isLocked = !unlocked[i];
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
                  aria-label={ex.name}
                  style={{
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                    padding: "10px 14px",
                    borderRadius: "12px",
                    background: "#fff",
                    border: "none",
                    boxShadow: isSelected
                      ? `inset 4px 0 0 ${tree.color}, 0 3px 8px rgba(40,30,20,0.10)`
                      : "0 1px 2px rgba(40,30,20,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
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
                    paddingRight: (isSelected || isLocked) ? "24px" : 0,
                    color: isLocked ? "#b0a89b" : "#3a352e",
                  }}>
                    {ex.name}
                  </span>
                </button>
                {isSelected && !isLocked && (
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
                {isLocked && (
                  <button
                    type="button"
                    aria-label={`Add equipment for ${ex.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestEquipment(tree.id, i, ex);
                    }}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "4px",
                      padding: "2px 8px",
                      background: "none",
                      border: "none",
                      color: tree.color,
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "22px",
                      fontWeight: 400,
                      lineHeight: 1,
                    }}
                  >
                    +
                  </button>
                )}
              </div>
            );
          })}
          {/* Trailing spacer lets tile[last] reach the viewport center at max scroll. */}
          <div style={{ flex: `0 0 ${SPACER}` }} aria-hidden />
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
        {canGoPrev && (
          <button
            type="button"
            aria-label="Previous progression"
            onClick={() => stepTo(centered - 1)}
            style={chevronStyle({ side: "left", color: tree.color })}
          >
            <Chevron direction="left" />
          </button>
        )}
        {canGoNext && (
          <button
            type="button"
            aria-label="Next progression"
            onClick={() => stepTo(centered + 1)}
            style={chevronStyle({ side: "right", color: tree.color })}
          >
            <Chevron direction="right" />
          </button>
        )}
      </div>
    </>
  );
}

function chevronStyle({ side, color }) {
  // Left chevron sits just to the left of the active tile (in the empty space
  // past the row name). Right chevron sits just inside the faded next tile.
  const leftOffset = `calc(50% - ${TILE_W / 2 + 28}px)`;
  const rightOffset = `calc(50% + ${TILE_W / 2 + 6}px)`;
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: side === "left" ? leftOffset : rightOffset,
    width: "22px",
    height: "22px",
    border: "none",
    background: "transparent",
    color,
    opacity: 0.7,
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  };
}

function Chevron({ direction }) {
  const d = direction === "left" ? "M7.5 2.5L3.5 6.5L7.5 10.5" : "M4.5 2.5L8.5 6.5L4.5 10.5";
  return (
    <svg width="12" height="13" viewBox="0 0 12 13" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
