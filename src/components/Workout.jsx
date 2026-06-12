import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { TREES } from "../data/trees";

const SETS = 3;
const REST_STRENGTH = 90;
const REST_CORE = 60;
const SLIDE_MS = 350;
const SKIP_SECS = 10;   // a tap on the rest tile knocks off this many seconds

const PHASES = [
  { name: "First Pair", treeIdxs: [0, 1], rest: REST_STRENGTH },
  { name: "Second Pair", treeIdxs: [2, 3], rest: REST_STRENGTH },
  { name: "Third Pair", treeIdxs: [4, 5], rest: REST_STRENGTH },
  { name: "Core Triplet", treeIdxs: [6, 7, 8], rest: REST_CORE },
];

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function fade(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildQueue(idxs) {
  const q = [];
  for (let s = 1; s <= SETS; s++) {
    for (const idx of idxs) q.push(idx);
  }
  return q;
}

export default function Workout({ activeLevels, paused, onPause, onEnd }) {
  // Freeze the selected levels at the start of the session so toggling equipment
  // while paused can't scramble the in-progress queue.
  const [levels] = useState(activeLevels);

  const [phaseIdx, setPhaseIdx] = useState(0);
  const [queuePos, setQueuePos] = useState(0);
  const [resting, setResting] = useState(null); // { remaining, total }

  const isComplete = phaseIdx >= PHASES.length;
  const phase = isComplete ? null : PHASES[phaseIdx];

  // A row whose selected level is null has no unlocked tile for the user's
  // equipment, so it drops out of the workout entirely.
  const availableFor = (p) =>
    p >= PHASES.length ? [] : PHASES[p].treeIdxs.filter((i) => levels[TREES[i].id] != null);
  const availableIdxs = useMemo(() => availableFor(phaseIdx), [phaseIdx, levels]);
  const queue = useMemo(() => buildQueue(availableIdxs), [availableIdxs]);

  const activeMv = !resting && queuePos < queue.length ? queue[queuePos] : null;
  const restingMv = resting && queuePos > 0 ? queue[queuePos - 1] : null;
  const setsDoneFor = (idx) => {
    let c = 0;
    for (let i = 0; i < queuePos; i++) if (queue[i] === idx) c++;
    return c;
  };

  // --- Rest countdown --------------------------------------------------------
  const restActive = resting !== null && !paused;
  useEffect(() => {
    if (!restActive) return;
    const id = setInterval(() => setResting((prev) => {
      if (!prev) return null;
      if (prev.remaining <= 1) return null;
      return { ...prev, remaining: prev.remaining - 1 };
    }), 1000);
    return () => clearInterval(id);
  }, [restActive]);

  const skipRest = () => setResting((prev) => {
    if (!prev) return null;
    if (prev.remaining <= SKIP_SECS) return null; // taps the last <=10s away
    return { ...prev, remaining: prev.remaining - SKIP_SECS };
  });

  // When a phase's sets are all done (and the trailing rest has elapsed) advance
  // to the next phase; the slide animation carries it in.
  useEffect(() => {
    if (!phase) return;
    if (queuePos >= queue.length && !resting) {
      setPhaseIdx((i) => i + 1);
      setQueuePos(0);
    }
  }, [queuePos, queue.length, phase, resting]);

  useEffect(() => {
    if (paused) return;
    const onKey = (e) => { if (e.key === "Escape") onPause(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused, onPause]);

  const markDone = () => {
    if (!phase || resting) return;
    if (queuePos >= queue.length) return;
    const newPos = queuePos + 1;
    setQueuePos(newPos);
    const phaseDone = newPos >= queue.length;
    const finalPhase = phaseIdx >= PHASES.length - 1;
    // Rest after every set, including the last set of a pair, except the very
    // last set of the whole workout (which goes straight to the complete view).
    if (!phaseDone || !finalPhase) {
      setResting({ remaining: phase.rest, total: phase.rest });
    }
  };

  // --- Viewing index (browse pairs without moving in the workout) ------------
  // `viewIdx` is which pair/triplet is on screen. It follows the active phase as
  // the workout progresses, but the chevrons let you look ahead or back freely
  // without touching phaseIdx/queuePos — purely for looking.
  const [viewIdx, setViewIdx] = useState(phaseIdx);
  const prevPhaseRef = useRef(phaseIdx);
  // useLayoutEffect (here and for the slide trigger) so the view/slide are set
  // up before paint — otherwise the new pair flashes for a frame first.
  useLayoutEffect(() => {
    if (prevPhaseRef.current !== phaseIdx) {
      prevPhaseRef.current = phaseIdx;
      setViewIdx(phaseIdx);
    }
  }, [phaseIdx]);

  // --- Slide animation -------------------------------------------------------
  // Slide whenever the viewed pair changes (from progress or browsing), in the
  // direction of travel.
  const prevViewRef = useRef(viewIdx);
  const [slide, setSlide] = useState(null); // { from, to }
  const [slideActive, setSlideActive] = useState(false);

  const browse = (delta) => {
    if (slide) return; // ignore taps mid-animation
    setViewIdx((v) => Math.max(0, Math.min(PHASES.length - 1, v + delta)));
  };

  useLayoutEffect(() => {
    if (prevViewRef.current !== viewIdx) {
      const from = prevViewRef.current;
      prevViewRef.current = viewIdx;
      setSlide({ from, to: viewIdx });
      setSlideActive(false);
    }
  }, [viewIdx]);

  useEffect(() => {
    if (!slide) return;
    const raf = requestAnimationFrame(() => setSlideActive(true));
    const t = setTimeout(() => { setSlide(null); setSlideActive(false); }, SLIDE_MS + 20);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [slide]);

  if (paused) return null;

  // Renders one phase's vertical stack of movements. The live (active) phase
  // wires up the set state and is the only interactive one; phases you've
  // already finished show full dots, ones still ahead show empty dots.
  const renderPanel = (idx) => {
    if (idx >= PHASES.length) return <CompleteView onEnd={onEnd} />;
    const live = idx === phaseIdx;
    const idxs = availableFor(idx);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {idxs.map((tIdx) => {
          const tree = TREES[tIdx];
          const node = tree.nodes[levels[tree.id]];
          const isResting = live && restingMv === tIdx;
          const isActive = live && activeMv === tIdx;
          const count = live ? setsDoneFor(tIdx) : idx < phaseIdx ? SETS : 0;
          return (
            <Tile
              key={tree.id}
              tree={tree}
              node={node}
              count={count}
              isResting={isResting}
              isActive={isActive}
              restRemaining={isResting ? resting.remaining : 0}
              restTotal={isResting ? resting.total : 0}
              onMarkDone={markDone}
              onSkipRest={skipRest}
            />
          );
        })}
      </div>
    );
  };

  // Renders one pair/triplet as a self-contained modal card (header + panel +
  // chevrons). During a transition two of these ride a full-screen track so each
  // pair slides in from the edge of the screen like its own modal.
  const renderModal = (idx) => {
    const complete = idx >= PHASES.length;
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-title"
        style={{
          width: "100%",
          maxWidth: "380px",
          margin: "auto",
          boxSizing: "border-box",
          background: "#fff",
          color: "#3a352e",
          borderRadius: "14px",
          padding: "16px 18px 18px",
          boxShadow: "0 12px 32px rgba(40,30,20,0.18)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Header: left-aligned phase title with the pause button vertically
            centered in the corner. */}
        <div style={{ position: "relative", minHeight: "28px", marginBottom: "16px", paddingRight: "36px" }}>
          <h2
            id="workout-title"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "22px",
              fontWeight: 500,
              margin: 0,
              lineHeight: "28px",
              color: "#3a352e",
            }}
          >
            {complete ? "" : PHASES[idx].name}
          </h2>
          {!complete && (
            <button
              type="button"
              onClick={onPause}
              aria-label="Pause workout"
              style={{
                position: "absolute",
                top: "50%",
                right: "2px",
                transform: "translateY(-50%)",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#a09888",
              }}
            >
              <span style={{ width: "4px", height: "14px", borderRadius: "1px", background: "currentColor" }} />
              <span style={{ width: "4px", height: "14px", borderRadius: "1px", background: "currentColor" }} />
            </button>
          )}
        </div>

        {renderPanel(idx)}
      </div>
    );
  };

  // Each modal lives in a full-viewport cell that scrolls (centering its card
  // with auto margins so a tall triplet stays fully reachable); during a slide
  // the cells ride a 200%-wide track that translates one screen over.
  const cellStyle = {
    flex: "0 0 50%",
    height: "100%",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    padding: "24px 30px",
    boxSizing: "border-box",
    WebkitOverflowScrolling: "touch",
  };
  const forward = slide && slide.to > slide.from;
  const canGoPrev = !isComplete && viewIdx > 0;
  const canGoNext = !isComplete && viewIdx < PHASES.length - 1;

  return (
    <div
      onClick={onPause}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40,30,20,0.45)",
        overflow: "hidden",
        zIndex: 10,
      }}
    >
      {slide ? (
        <div
          style={{
            display: "flex",
            width: "200%",
            height: "100%",
            pointerEvents: "none",
            transform: slideActive
              ? (forward ? "translateX(-50%)" : "translateX(0)")
              : (forward ? "translateX(0)" : "translateX(-50%)"),
            transition: slideActive ? `transform ${SLIDE_MS}ms ease` : "none",
          }}
        >
          <div style={cellStyle}>{renderModal(forward ? slide.from : slide.to)}</div>
          <div style={cellStyle}>{renderModal(forward ? slide.to : slide.from)}</div>
        </div>
      ) : (
        <div style={cellStyle}>{renderModal(viewIdx)}</div>
      )}

      {/* Chevrons live above the sliding track and stay put — they're anchored
          to the screen, not to the modals, so they don't move during a slide. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          padding: "0 30px",
          boxSizing: "border-box",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div style={{ position: "relative", width: "100%", maxWidth: "380px" }}>
          {canGoPrev && (
            <button
              type="button"
              aria-label="View previous pair"
              onClick={(e) => { e.stopPropagation(); browse(-1); }}
              style={chevronStyle("left")}
            >
              <Chevron direction="left" />
            </button>
          )}
          {canGoNext && (
            <button
              type="button"
              aria-label="View next pair"
              onClick={(e) => { e.stopPropagation(); browse(1); }}
              style={chevronStyle("right")}
            >
              <Chevron direction="right" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Tile({ tree, node, count, isResting, isActive, restRemaining, restTotal, onMarkDone, onSkipRest }) {
  // Waiting and done tiles dim uniformly so every rest period looks the same;
  // the dots are what tell them apart.
  const dim = !isResting && !isActive;
  const interactive = isActive || isResting;
  const onActivate = isActive ? onMarkDone : isResting ? onSkipRest : undefined;
  const containerProps = interactive ? {
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onActivate(); }
    },
    "aria-label": isActive ? `Done with set ${count + 1} of ${SETS}` : "Skip 10 seconds of rest",
  } : {};

  return (
    <div
      {...containerProps}
      style={{
        position: "relative",
        background: isResting ? "#faf6ef" : "#fff",
        border: "1px solid #e8e2d8",
        borderLeft: `4px solid ${dim ? fade(tree.color, 0.4) : tree.color}`,
        borderRadius: "12px",
        padding: "12px 14px 14px",
        cursor: interactive ? "pointer" : "default",
        userSelect: "none",
      }}
    >
      <div style={{
        visibility: isResting ? "hidden" : "visible",
        opacity: dim ? 0.45 : 1,
        transition: "opacity 0.2s ease",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "15px", fontWeight: 600, color: "#3a352e" }}>
            {node.name}
          </span>
          <Dots count={count} total={SETS} color={tree.color} />
        </div>
        <ol style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: 1.5, color: "#5a5248" }}>
          {node.steps.map((s, i) => (
            <li key={i} style={{ marginBottom: i < node.steps.length - 1 ? "6px" : 0 }}>{s}</li>
          ))}
        </ol>
      </div>

      {isResting && (
        <div style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
          padding: "12px 20px",
          borderRadius: "12px",
        }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "26px",
            fontWeight: 700,
            letterSpacing: "3px",
            textTransform: "uppercase",
            color: tree.color,
            lineHeight: 1,
          }}>
            Rest
          </div>
          <CircleProgress remaining={restRemaining} total={restTotal} color={tree.color} size={92} />
        </div>
      )}
    </div>
  );
}

// Chevrons sit just outside the modal's edges, in the cell's side gutter,
// vertically centered on the card.
function chevronStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    [side]: "-27px",
    width: "24px",
    height: "44px",
    border: "none",
    background: "transparent",
    color: "#3a352e",
    opacity: 1,
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "auto",
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
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? (total - remaining) / total : 0;
  const dashOffset = circumference * (1 - pct);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
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
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Fraunces', serif",
        fontSize: "26px",
        fontWeight: 300,
        color: "#3a352e",
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1,
      }}>
        {fmt(remaining)}
      </div>
    </div>
  );
}

function Dots({ count, total, color }) {
  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: "12px",
          height: "12px",
          borderRadius: "50%",
          background: i < count ? color : "transparent",
          border: `2px solid ${i < count ? color : "#d6cfc1"}`,
        }} />
      ))}
    </div>
  );
}

function CompleteView({ onEnd }) {
  return (
    <div style={{ padding: "4px 6px 2px" }}>
      <h2
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "24px",
          fontWeight: 500,
          margin: "0 0 10px",
          color: "#3a352e",
          textAlign: "center",
        }}
      >
        Workout complete
      </h2>
      <p style={{ margin: "0 0 22px", fontSize: "14px", lineHeight: 1.55, color: "#5a5248", textAlign: "center" }}>
        Nice work. Cool down with a few minutes of easy mobility.
      </p>
      <button
        type="button"
        onClick={onEnd}
        style={{
          display: "block",
          width: "100%",
          padding: "15px 16px",
          border: "none",
          borderRadius: "12px",
          background: "#7f9870",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "15px",
          fontWeight: 700,
          letterSpacing: "0.3px",
          cursor: "pointer",
          boxShadow: "0 2px 8px rgba(127,152,112,0.35)",
        }}
      >
        End workout
      </button>
    </div>
  );
}
