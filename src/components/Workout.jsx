import { useEffect, useMemo, useState } from "react";
import { TREES } from "../data/trees";

const SETS = 3;
const REST_STRENGTH = 90;
const REST_CORE = 60;

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

function buildQueue(phase) {
  const q = [];
  for (let s = 1; s <= SETS; s++) {
    for (const idx of phase.treeIdxs) q.push(idx);
  }
  return q;
}

export default function Workout({ activeLevels, onClose }) {
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [queuePos, setQueuePos] = useState(0);
  const [resting, setResting] = useState(null);

  const isComplete = phaseIdx >= PHASES.length;
  const phase = isComplete ? null : PHASES[phaseIdx];
  const queue = useMemo(() => (phase ? buildQueue(phase) : []), [phase]);

  const restActive = resting !== null;
  useEffect(() => {
    if (!restActive) return;
    const id = setInterval(() => {
      setResting((prev) => {
        if (!prev) return null;
        if (prev.remaining <= 1) return null;
        return { ...prev, remaining: prev.remaining - 1 };
      });
    }, 1000);
    return () => clearInterval(id);
  }, [restActive]);

  useEffect(() => {
    if (!phase) return;
    if (queuePos >= queue.length && !resting) {
      setPhaseIdx((i) => i + 1);
      setQueuePos(0);
    }
  }, [queuePos, queue.length, phase, resting]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const markDone = () => {
    if (!phase || resting) return;
    if (queuePos >= queue.length) return;
    const newPos = queuePos + 1;
    setQueuePos(newPos);
    if (newPos < queue.length) {
      setResting({ remaining: phase.rest, total: phase.rest });
    }
  };

  const restingIdx = resting && queuePos > 0 ? queue[queuePos - 1] : null;
  const activeIdx = !resting && queuePos < queue.length ? queue[queuePos] : null;

  const setsDoneFor = (idx) => {
    let c = 0;
    for (let i = 0; i < queuePos; i++) if (queue[i] === idx) c++;
    return c;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(40,30,20,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        zIndex: 10,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="workout-title"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "380px",
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          background: "#fff",
          color: "#3a352e",
          borderRadius: "14px",
          padding: "22px 22px 20px",
          boxShadow: "0 12px 32px rgba(40,30,20,0.18)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close workout"
          style={{
            position: "absolute",
            top: "8px",
            right: "10px",
            width: "32px",
            height: "32px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "22px",
            lineHeight: 1,
            color: "#a09888",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ×
        </button>

        {isComplete ? (
          <CompleteView onClose={onClose} />
        ) : (
          <>
            <h2
              id="workout-title"
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: "22px",
                fontWeight: 500,
                margin: "0 0 16px",
                paddingRight: "32px",
                color: "#3a352e",
              }}
            >
              {phase.name}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {phase.treeIdxs.map((idx) => {
                const tree = TREES[idx];
                const node = tree.nodes[activeLevels[tree.id]];
                const count = setsDoneFor(idx);
                const isThisResting = restingIdx === idx;
                const isThisActive = activeIdx === idx;
                const isDone = count >= SETS;
                return (
                  <Tile
                    key={tree.id}
                    tree={tree}
                    node={node}
                    count={count}
                    isResting={isThisResting}
                    isActive={isThisActive}
                    isDone={isDone}
                    restRemaining={isThisResting ? resting.remaining : 0}
                    restTotal={isThisResting ? resting.total : 0}
                    onMarkDone={markDone}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ tree, node, count, isResting, isActive, isDone, restRemaining, restTotal, onMarkDone }) {
  const grayed = !isResting && !isActive && !isDone;
  const cardStyle = {
    position: "relative",
    background: isResting ? "#faf6ef" : "#fff",
    border: "1px solid #e8e2d8",
    borderLeft: `4px solid ${grayed ? fade(tree.color, 0.4) : tree.color}`,
    borderRadius: "12px",
    padding: "12px 14px 14px",
    opacity: isDone ? 0.55 : 1,
    transition: "opacity 0.2s ease, background 0.2s ease",
    cursor: isActive ? "pointer" : "default",
    userSelect: "none",
  };

  const containerProps = isActive ? {
    role: "button",
    tabIndex: 0,
    onClick: onMarkDone,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onMarkDone();
      }
    },
    "aria-label": `Done with set ${count + 1} of ${SETS}`,
  } : {};

  return (
    <div style={cardStyle} {...containerProps}>
      <div style={{ visibility: isResting ? "hidden" : "visible" }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          marginBottom: "8px",
          opacity: grayed ? 0.4 : 1,
          transition: "opacity 0.2s ease",
        }}>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px",
            fontWeight: 600,
            color: "#3a352e",
          }}>
            {node.name}
          </span>
          <Dots count={count} total={SETS} color={tree.color} />
        </div>
        <ol style={{
          margin: 0,
          paddingLeft: "18px",
          fontSize: "13px",
          lineHeight: 1.5,
          color: "#5a5248",
        }}>
          {node.steps.map((s, i) => (
            <li key={i} style={{ marginBottom: i < node.steps.length - 1 ? "6px" : 0 }}>
              {s}
            </li>
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
          <CircleProgress
            remaining={restRemaining}
            total={restTotal}
            color={tree.color}
            size={92}
          />
        </div>
      )}
    </div>
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
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#efeae0"
          strokeWidth={strokeWidth}
        />
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
          style={{ transition: "stroke-dashoffset 0.5s linear" }}
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

function CompleteView({ onClose }) {
  return (
    <>
      <h2
        id="workout-title"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "22px",
          fontWeight: 500,
          margin: "0 0 10px",
          paddingRight: "32px",
          color: "#3a352e",
        }}
      >
        Workout complete
      </h2>
      <p style={{
        margin: "0 0 18px",
        fontSize: "14px",
        lineHeight: 1.55,
        color: "#5a5248",
      }}>
        Nice work. Cool down with a few minutes of easy mobility.
      </p>
      <button
        type="button"
        onClick={onClose}
        style={{
          display: "block",
          width: "100%",
          padding: "12px 16px",
          border: "none",
          borderRadius: "10px",
          background: "#7f9870",
          color: "#fff",
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "0.3px",
          cursor: "pointer",
        }}
      >
        Close
      </button>
    </>
  );
}
