import { useRef, useEffect, useState } from "react";
import { nodeUnlocked } from "../data/equipment";
import { fade } from "../theme";
import { SETS } from "../useWorkoutSession";

const TILE_W = 190;
const TILE_MIN_H = 52;
// Cap for the inline-instructions block while it animates open. Generous:
// the longest steps render ~150px tall at tile width (checked empirically).
const STEPS_MAX_H = 300;
const LABEL_W = 84;
const ROW_MIN_H = 72;
// Gap between tiles. Wide enough that the right chevron (which sits just past
// the active tile) doesn't overlap the next tile.
const GAP = 32;
// Symmetric spacers center tile[0] and tile[last] in the viewport at the scroll extremes.
const SPACER = `calc(50% - ${TILE_W / 2 + GAP}px)`;

// A session-expanded tile keeps its centered left edge and stretches to just
// shy of the viewport's right edge so its inline instructions get the width.
const EXPANDED_TILE_W = `calc(50% + ${TILE_W / 2 - 12}px)`;

// Previous tiles fully hidden (alpha=0 up to just before the active tile).
// Active tile opaque. Past the active tile, fades so the next tile shows faded.
const EDGE_FADE_MASK = `linear-gradient(to right, ` +
  `rgba(0,0,0,0) 0, ` +
  `rgba(0,0,0,0) calc(50% - ${TILE_W / 2 + GAP}px), ` +
  `rgba(0,0,0,1) calc(50% - ${TILE_W / 2}px), ` +
  `rgba(0,0,0,1) calc(50% + ${TILE_W / 2}px), ` +
  `rgba(0,0,0,0.6) calc(50% + ${TILE_W / 2 + GAP}px), ` +
  `rgba(0,0,0,0) 100%)`;

// Expanded session rows drop the right-hand fade so the widened tile paints
// clear to the viewport edge (tiles pushed past it are clipped, not faded).
const SESSION_EXPANDED_MASK = `linear-gradient(to right, ` +
  `rgba(0,0,0,0) 0, ` +
  `rgba(0,0,0,0) calc(50% - ${TILE_W / 2 + GAP}px), ` +
  `rgba(0,0,0,1) calc(50% - ${TILE_W / 2}px), ` +
  `rgba(0,0,0,1) 100%)`;

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// `session` is null outside a workout. During one it carries this row's slice
// of the session: { level, phase, role, setsDone, dropped,
// restRemaining, restTotal, onMarkDone, onSkipRest }.
export default function ProgressionRow({ tree, activeLevel, owned, session, onLevelChange, onOpenInstructions, onRequestEquipment }) {
  const scrollerRef = useRef(null);
  const tileRefs = useRef([]);
  const rafRef = useRef(null);
  const inSession = session != null;
  // During a session the row displays the session's frozen level, so a
  // mid-session equipment re-clamp can't desync the tiles from the queue.
  const displayLevel = inSession ? session.level : activeLevel;
  // The tile currently in the center column (locked or not) — drives the chevrons,
  // which step one tile at a time so grayed tiles stay reachable.
  const [centered, setCentered] = useState(activeLevel ?? 0);

  const unlocked = tree.nodes.map((n) => nodeUnlocked(n, owned));

  // Set scrollLeft directly rather than scrollIntoView so we never perturb the
  // vertical scroll position of the rows column above us.
  const centerTile = (idx) => {
    const scroller = scrollerRef.current;
    const tile = tileRefs.current[idx];
    if (!scroller || !tile) return;
    const scrollerRect = scroller.getBoundingClientRect();
    const targetTileLeft = scrollerRect.left + (scrollerRect.width - TILE_W) / 2;
    scroller.scrollLeft += tile.getBoundingClientRect().left - targetTileLeft;
  };

  // Center without animation on mount, and again whenever session mode
  // toggles: entering snaps to the frozen level, leaving snaps back to the
  // live selection. (Not on every level change — mid-swipe re-centering would
  // fight the user's scroll.)
  useEffect(() => {
    if (displayLevel != null) centerTile(displayLevel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inSession]);

  const handleScroll = () => {
    if (inSession) return; // scroller is locked during a workout
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

  // Rows not in play (and rows with no unlocked tile) sit back and are
  // view-only until the workout ends. A row stays lit while it's expanded
  // (current pair, or the next pair previewed during a trailing rest) or
  // while its rest ring is still ticking.
  const dimRow = inSession && (session.dropped || (!session.expanded && session.role !== "resting"));
  // An expanded session row grows its selected tile rightward to the viewport edge.
  const rowExpanded = inSession && !session.dropped && session.expanded;

  return (
    <>
      <style>{`.tile-scroller::-webkit-scrollbar { display: none; }`}</style>
      <div style={{
        // Basis auto so an expanded tile (inline instructions during a
        // session) can grow the row with its content; behaves exactly like
        // a 72px basis when the content is a one-line tile.
        flex: "1 0 auto",
        minHeight: `${ROW_MIN_H}px`,
        display: "flex",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        opacity: dimRow ? 0.45 : 1,
        pointerEvents: dimRow ? "none" : "auto",
        transition: "opacity 0.3s ease",
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
            overflowX: inSession ? "hidden" : "auto",
            overflowY: "hidden",
            scrollSnapType: inSession ? "none" : "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
            // overflow-x: auto forces vertical clipping too, which would cut
            // off the selected tile's shadow. Negative margins with matching
            // extra padding keep the tiles in place (5px inset, as before) but
            // give the shadow room to paint past the row's edges.
            marginTop: "-10px",
            marginBottom: "-14px",
            paddingTop: "15px",
            paddingBottom: "19px",
            maskImage: rowExpanded ? SESSION_EXPANDED_MASK : EDGE_FADE_MASK,
            WebkitMaskImage: rowExpanded ? SESSION_EXPANDED_MASK : EDGE_FADE_MASK,
          }}
        >
          {/* Leading spacer lets tile[0] reach the viewport center at scrollLeft = 0. */}
          <div style={{ flex: `0 0 ${SPACER}` }} aria-hidden />
          {tree.nodes.map((ex, i) => {
            const isSelected = i === displayLevel;
            const isLocked = !unlocked[i];
            // Only the selected tile of a current-phase row has a live role.
            const role = inSession && isSelected && session.phase === "current" ? session.role : null;
            const isRestingTile = role === "resting";
            const actionable = role === "active" || role === "resting";
            // Inline instructions on the selected tile of an expanded row —
            // resting included, so the tile holds its size while the ring ticks.
            const showSteps = inSession && isSelected && !session.dropped && session.expanded;
            return (
              <div
                key={i}
                ref={(el) => (tileRefs.current[i] = el)}
                style={{
                  position: "relative",
                  flex: `0 0 ${rowExpanded && isSelected ? EXPANDED_TILE_W : `${TILE_W}px`}`,
                  minHeight: `${TILE_MIN_H}px`,
                  scrollSnapAlign: "center",
                  display: "flex",
                  transition: "flex-basis 0.4s ease",
                }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    if (!inSession) {
                      e.currentTarget.scrollIntoView({
                        inline: "center", block: "nearest", behavior: "smooth",
                      });
                    } else if (role === "active") {
                      session.onMarkDone();
                    } else if (role === "resting") {
                      session.onSkipRest();
                    }
                  }}
                  aria-label={
                    role === "active" ? `Done with set ${session.setsDone + 1} of ${SETS}`
                    : role === "resting" ? "Skip 10 seconds of rest"
                    : ex.name
                  }
                  className={actionable ? "press" : undefined}
                  style={{
                    position: "relative",
                    flex: 1,
                    minWidth: 0,
                    // 12px sides so the longest name ("Parallel Bar Support Hold"
                    // at 13.5px ≈ 159px) fits the 190px tile on one line.
                    padding: "10px 12px",
                    borderRadius: "13px",
                    background: isSelected
                      ? `linear-gradient(0deg, ${fade(tree.color, 0.1)}, ${fade(tree.color, 0.1)}), #fff`
                      : isLocked ? "#faf7f1" : "#fffdf9",
                    border: isSelected
                      ? `1px solid ${fade(tree.color, 0.45)}`
                      : isLocked ? "1px dashed #ddd5c6" : "1px solid #ece5d8",
                    boxShadow: isSelected
                      ? `0 2px 8px ${fade(tree.color, 0.18)}, 0 1px 3px rgba(40,30,20,0.06)`
                      : isLocked ? "none" : "0 1px 2px rgba(40,30,20,0.04)",
                    // The waiting half of the current pair sits back a touch so
                    // the tile whose turn it is reads as live.
                    opacity: role === "waiting" ? 0.6 : 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: !inSession || actionable ? "pointer" : "default",
                    textAlign: "left",
                    transition: "box-shadow 0.2s ease, background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease",
                  }}
                >
                  {/* Progress sits along the tile's top edge, on the same
                      line as the circled-? button in the opposite corner.
                      Every tile carries it so the faded neighbors mirror
                      the selected tile's layout. */}
                  {inSession && !session.dropped && isSelected ? (
                    // Sets done this session (full for finished phases,
                    // empty for upcoming ones).
                    <span aria-hidden style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "5px" }}>
                      {Array.from({ length: SETS }).map((_, j) => (
                        <span key={j} style={{
                          width: "9px",
                          height: "9px",
                          borderRadius: "50%",
                          boxSizing: "border-box",
                          background: j < session.setsDone ? tree.color : "transparent",
                          border: `1.5px solid ${j < session.setsDone ? tree.color : fade(tree.color, 0.35)}`,
                        }} />
                      ))}
                    </span>
                  ) : (
                    <span aria-hidden style={{ position: "absolute", top: "15px", left: "12px", display: "flex", gap: "3px" }}>
                      {tree.nodes.map((_, j) => (
                        <span key={j} style={{
                          width: "9px",
                          height: "3px",
                          borderRadius: "2px",
                          background: isLocked
                            ? (j <= i ? "#c5beb0" : "#e8e2d5")
                            : (j <= i ? tree.color : fade(tree.color, 0.22)),
                        }} />
                      ))}
                    </span>
                  )}
                  {/* Rest countdown rides the top-right corner (the circled-?'s
                      spot outside a session) so the tile keeps its full size —
                      name and instructions stay put — while the ring ticks. */}
                  {isRestingTile && (
                    <span style={{
                      position: "absolute",
                      top: "7px",
                      right: "10px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                      <span style={{
                        fontFamily: "'Fraunces', serif",
                        fontStyle: "italic",
                        fontSize: "16px",
                        fontWeight: 600,
                        color: tree.color,
                        lineHeight: 1,
                      }}>
                        Rest
                      </span>
                      <CircleProgress remaining={session.restRemaining} total={session.restTotal} color={tree.color} size={36} />
                    </span>
                  )}
                  <span style={{
                    fontSize: "13.5px",
                    fontWeight: isSelected ? 700 : 500,
                    lineHeight: 1.2,
                    minWidth: 0,
                    whiteSpace: "nowrap",
                    color: isLocked ? "#b0a89b" : "#3a352e",
                    // The progress row rides along the top edge; nudge the
                    // name down (flex-center splits the margin in half) so
                    // it balances the space below it.
                    marginTop: "13px",
                  }}>
                    {ex.name}
                  </span>
                  {/* Inline instructions, expanded during a session on the
                      pair in play (and the previewed next pair). Always
                      mounted at max-height 0 so the expansion animates. */}
                  <span
                    aria-hidden={!showSteps}
                    style={{
                      display: "block",
                      alignSelf: "stretch",
                      overflow: "hidden",
                      maxHeight: showSteps ? `${STEPS_MAX_H}px` : "0px",
                      opacity: showSteps ? 1 : 0,
                      transition: "max-height 0.4s ease, opacity 0.35s ease",
                    }}
                  >
                    <span style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "10px 2px 2px" }}>
                      {(ex.steps || []).map((s, k) => (
                        <span key={k} style={{
                          display: "flex",
                          gap: "7px",
                          fontSize: "11.5px",
                          lineHeight: 1.45,
                          fontWeight: 500,
                          color: "#5a5248",
                          whiteSpace: "normal",
                          textAlign: "left",
                        }}>
                          <span style={{ color: tree.color, fontWeight: 700, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>
                            {k + 1}
                          </span>
                          <span style={{ minWidth: 0 }}>{s}</span>
                        </span>
                      ))}
                    </span>
                  </span>
                </button>
                {/* Hidden during a session — instructions render inline in the
                    expanded tile instead. */}
                {isSelected && !isLocked && !inSession && (
                  <button
                    type="button"
                    aria-label={`How to do ${ex.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenInstructions({ ...ex, color: tree.color });
                    }}
                    style={{
                      // Circle center sits 16.5px from the tile top — the same
                      // line the progress dots/ticks run along.
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      padding: "4px 8px",
                      background: "none",
                      border: "none",
                      color: tree.color,
                      cursor: "pointer",
                      lineHeight: 0,
                    }}
                  >
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden>
                      <circle cx="8.5" cy="8.5" r="7.75" stroke="currentColor" strokeWidth="1.4" />
                      <text
                        x="8.5"
                        y="12.2"
                        textAnchor="middle"
                        fontSize="10.5"
                        fontWeight="700"
                        fontFamily="'DM Sans', sans-serif"
                        fill="currentColor"
                      >
                        ?
                      </text>
                    </svg>
                  </button>
                )}
                {isLocked && !inSession && (
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
          fontSize: "15px",
          fontWeight: 600,
          color: "#4d463c",
          lineHeight: 1.15,
          pointerEvents: "none",
          zIndex: 1,
        }}>
          <div>{tree.name}</div>
        </div>
        {!inSession && canGoPrev && (
          <button
            type="button"
            aria-label="Previous progression"
            onClick={() => stepTo(centered - 1)}
            style={chevronStyle({ side: "left", color: tree.color })}
          >
            <Chevron direction="left" />
          </button>
        )}
        {!inSession && canGoNext && (
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

function CircleProgress({ remaining, total, color, size }) {
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? (total - remaining) / total : 0;
  const dashOffset = circumference * (1 - pct);
  return (
    <span style={{ position: "relative", width: size, height: size, display: "inline-block", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#efeae0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.3s linear" }}
        />
      </svg>
      <span style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fraunces', serif",
        fontSize: "12px",
        fontWeight: 500,
        color: "#3a352e",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}>
        {fmt(remaining)}
      </span>
    </span>
  );
}
