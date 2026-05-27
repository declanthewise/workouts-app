import { useEffect, useMemo, useRef, useState } from "react";
import { TREES } from "../data/trees";

const SETS = 3;
const REST_STRENGTH = 90;
const REST_CORE = 60;
const PAIRS = [[0, 1], [2, 3], [4, 5]];
const CORE = [6, 7, 8];

function buildSequence(activeLevels) {
  const steps = [];

  const addExercise = (treeIdx, setNumber, group) => {
    const tree = TREES[treeIdx];
    const node = tree.nodes[activeLevels[tree.id]];
    steps.push({
      type: "exercise",
      treeName: tree.name,
      color: tree.color,
      name: node.name,
      instructions: node.steps,
      setNumber,
      totalSets: SETS,
      group,
    });
  };

  const addRest = (seconds) => steps.push({ type: "rest", seconds });

  for (const [a, b] of PAIRS) {
    for (let s = 1; s <= SETS; s++) {
      addExercise(a, s, "strength");
      addRest(REST_STRENGTH);
      addExercise(b, s, "strength");
      addRest(REST_STRENGTH);
    }
  }

  for (let s = 1; s <= SETS; s++) {
    for (const idx of CORE) {
      addExercise(idx, s, "core");
      addRest(REST_CORE);
    }
  }

  while (steps.length && steps[steps.length - 1].type === "rest") steps.pop();

  return steps;
}

function fmt(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Workout({ activeLevels, onClose }) {
  const sequence = useMemo(() => buildSequence(activeLevels), [activeLevels]);
  const [stepIdx, setStepIdx] = useState(0);
  const step = sequence[stepIdx];
  const nextExercise = useMemo(() => {
    for (let i = stepIdx + 1; i < sequence.length; i++) {
      if (sequence[i].type === "exercise") return sequence[i];
    }
    return null;
  }, [sequence, stepIdx]);

  const [remaining, setRemaining] = useState(step?.type === "rest" ? step.seconds : 0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!step) return;
    if (step.type !== "rest") {
      setRemaining(0);
      return;
    }
    setRemaining(step.seconds);
    timerRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          setStepIdx((i) => Math.min(i + 1, sequence.length));
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [step, sequence.length]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const advance = () => setStepIdx((i) => Math.min(i + 1, sequence.length));
  const isComplete = stepIdx >= sequence.length;

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
          maxWidth: "360px",
          maxHeight: "calc(100dvh - 48px)",
          overflowY: "auto",
          background: "#fff",
          color: "#3a352e",
          borderRadius: "14px",
          padding: "22px 24px 20px",
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

        {!isComplete && (
          <div style={{
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#a09888",
            margin: "0 28px 10px 0",
          }}>
            Step {stepIdx + 1} of {sequence.length}
          </div>
        )}

        {isComplete && <CompleteView onClose={onClose} />}
        {!isComplete && step.type === "exercise" && (
          <ExerciseView step={step} onDone={advance} />
        )}
        {!isComplete && step.type === "rest" && (
          <RestView
            remaining={remaining}
            total={step.seconds}
            nextExercise={nextExercise}
            onSkip={advance}
          />
        )}
      </div>
    </div>
  );
}

function ExerciseView({ step, onDone }) {
  return (
    <>
      <div style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        color: step.color,
        marginBottom: "4px",
      }}>
        {step.treeName} · Set {step.setNumber} of {step.totalSets}
      </div>
      <h2
        id="workout-title"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "22px",
          fontWeight: 500,
          margin: "0 0 14px",
          color: "#3a352e",
        }}
      >
        {step.name}
      </h2>
      <ol
        style={{
          margin: "0 0 18px",
          paddingLeft: "20px",
          fontSize: "14px",
          lineHeight: 1.55,
          color: "#5a5248",
        }}
      >
        {step.instructions.map((s, i) => (
          <li key={i} style={{ marginBottom: i < step.instructions.length - 1 ? "8px" : 0 }}>
            {s}
          </li>
        ))}
      </ol>
      <PrimaryButton color={step.color} onClick={onDone}>Done with set</PrimaryButton>
    </>
  );
}

function RestView({ remaining, total, nextExercise, onSkip }) {
  const pct = total > 0 ? ((total - remaining) / total) * 100 : 0;
  return (
    <>
      <h2
        id="workout-title"
        style={{
          fontFamily: "'Fraunces', serif",
          fontSize: "22px",
          fontWeight: 500,
          margin: "0 0 16px",
          color: "#3a352e",
        }}
      >
        Rest
      </h2>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: "56px",
        fontWeight: 300,
        textAlign: "center",
        color: "#3a352e",
        lineHeight: 1.1,
        marginBottom: "10px",
        fontVariantNumeric: "tabular-nums",
      }}>
        {fmt(remaining)}
      </div>
      <div style={{
        height: "4px",
        background: "#efeae0",
        borderRadius: "2px",
        overflow: "hidden",
        marginBottom: "18px",
      }}>
        <div style={{
          width: `${pct}%`,
          height: "100%",
          background: "#b8a886",
          transition: "width 0.5s linear",
        }} />
      </div>
      {nextExercise && (
        <div style={{
          fontSize: "13px",
          color: "#5a5248",
          marginBottom: "16px",
          textAlign: "center",
        }}>
          <span style={{
            display: "block",
            fontSize: "10.5px",
            fontWeight: 700,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "#a09888",
            marginBottom: "4px",
          }}>
            Up next
          </span>
          <span style={{ fontWeight: 500, color: nextExercise.color }}>{nextExercise.treeName}</span>
          {" · "}{nextExercise.name}
          {" · Set "}{nextExercise.setNumber}/{nextExercise.totalSets}
        </div>
      )}
      <SecondaryButton onClick={onSkip}>Skip rest</SecondaryButton>
    </>
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
      <PrimaryButton color="#7f9870" onClick={onClose}>Close</PrimaryButton>
    </>
  );
}

function PrimaryButton({ color, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "12px 16px",
        border: "none",
        borderRadius: "10px",
        background: color,
        color: "#fff",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 600,
        letterSpacing: "0.3px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "block",
        width: "100%",
        padding: "11px 16px",
        border: "1px solid #dfd8cc",
        borderRadius: "10px",
        background: "#fff",
        color: "#5a5248",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
