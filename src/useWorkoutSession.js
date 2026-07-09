import { useEffect, useMemo, useState } from "react";
import { TREES } from "./data/trees";

export const SETS = 3;
const REST_STRENGTH = 90;
const REST_CORE = 60;
const SKIP_SECS = 10; // a tap on the resting tile knocks off this many seconds

const PHASES = [
  { treeIdxs: [0, 1], rest: REST_STRENGTH },
  { treeIdxs: [2, 3], rest: REST_STRENGTH },
  { treeIdxs: [4, 5], rest: REST_STRENGTH },
  { treeIdxs: [6, 7, 8], rest: REST_CORE },
];

// One phase's set queue: its movements interleaved, one pass per set.
function buildQueue(idxs) {
  const q = [];
  for (let s = 1; s <= SETS; s++) {
    for (const idx of idxs) q.push(idx);
  }
  return q;
}

// A row whose selected level is null has no unlocked tile for the user's
// equipment, so it drops out of the workout entirely.
const availableFor = (levels, p) =>
  p >= PHASES.length ? [] : PHASES[p].treeIdxs.filter((i) => levels[TREES[i].id] != null);

// Session engine for a workout running inside the home rows. Returns null when
// no session is running.
export default function useWorkoutSession(running, activeLevels) {
  // All session state lives in one object so starting/stopping resets it as a
  // unit (via render-phase resets, so the first session frame is already in
  // session mode). Levels are frozen at start so toggling equipment
  // mid-session can't scramble the queue.
  const [s, setS] = useState(null);
  if (running && !s) setS({ levels: activeLevels, phaseIdx: 0, queuePos: 0, resting: null });
  if (!running && s) setS(null);

  const live = running ? s : null;
  const isComplete = !!live && live.phaseIdx >= PHASES.length;

  const queue = useMemo(
    () => (live ? buildQueue(availableFor(live.levels, live.phaseIdx)) : []),
    [live?.levels, live?.phaseIdx]
  );

  // --- Rest countdown -------------------------------------------------------
  const restActive = !!live && live.resting !== null;
  useEffect(() => {
    if (!restActive) return;
    const id = setInterval(() => setS((prev) => {
      if (!prev || !prev.resting) return prev;
      if (prev.resting.remaining <= 1) return { ...prev, resting: null };
      return { ...prev, resting: { ...prev.resting, remaining: prev.resting.remaining - 1 } };
    }), 1000);
    return () => clearInterval(id);
  }, [restActive]);

  // When a phase's sets are all done (and the trailing rest has elapsed),
  // advance to the next phase.
  useEffect(() => {
    if (!live || isComplete) return;
    if (live.queuePos >= queue.length && !live.resting) {
      setS((prev) => prev && { ...prev, phaseIdx: prev.phaseIdx + 1, queuePos: 0 });
    }
  }, [live?.phaseIdx, live?.queuePos, live?.resting, queue.length, isComplete]);

  const markDone = () => {
    setS((prev) => {
      if (!prev || prev.resting || prev.phaseIdx >= PHASES.length) return prev;
      const q = buildQueue(availableFor(prev.levels, prev.phaseIdx));
      if (prev.queuePos >= q.length) return prev;
      const newPos = prev.queuePos + 1;
      // Rest after every set except the very last of the whole workout.
      const lastOfWorkout = newPos >= q.length && prev.phaseIdx >= PHASES.length - 1;
      const rest = PHASES[prev.phaseIdx].rest;
      return { ...prev, queuePos: newPos, resting: lastOfWorkout ? null : { remaining: rest, total: rest } };
    });
  };

  const skipRest = () => {
    setS((prev) => {
      if (!prev || !prev.resting) return prev;
      if (prev.resting.remaining <= SKIP_SECS) return { ...prev, resting: null };
      return { ...prev, resting: { ...prev.resting, remaining: prev.resting.remaining - SKIP_SECS } };
    });
  };

  if (!live) return null;

  const { levels, phaseIdx, queuePos, resting } = live;
  const activeMv = !resting && queuePos < queue.length ? queue[queuePos] : null;
  const restingMv = resting && queuePos > 0 ? queue[queuePos - 1] : null;

  const rowState = (treeIdx) => {
    const dropped = levels[TREES[treeIdx].id] == null;
    const rowPhase = PHASES.findIndex((p) => p.treeIdxs.includes(treeIdx));
    const phase = isComplete || rowPhase < phaseIdx ? "done" : rowPhase === phaseIdx ? "current" : "upcoming";
    let setsDone = 0;
    if (!dropped) {
      if (phase === "done") setsDone = SETS;
      else if (phase === "current") {
        for (let i = 0; i < queuePos; i++) if (queue[i] === treeIdx) setsDone++;
      }
    }
    const role = phase !== "current" || dropped ? null
      : activeMv === treeIdx ? "active"
      : restingMv === treeIdx ? "resting"
      : "waiting";
    return { phase, role, setsDone, dropped };
  };

  return {
    levels,
    phaseIdx,
    isComplete,
    restRemaining: resting ? resting.remaining : 0,
    restTotal: resting ? resting.total : 0,
    markDone,
    skipRest,
    rowState,
  };
}
