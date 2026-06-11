import { useState, useEffect, useLayoutEffect, useCallback, useRef, forwardRef, Fragment } from "react";
import { TREES } from "./data/trees";
import { EQUIPMENT_IDS, nodeUnlocked } from "./data/equipment";
import ProgressionRow from "./components/ProgressionRow";
import About from "./components/About";
import MyGym from "./components/MyGym";
import Instructions from "./components/Instructions";
import EquipmentPrompt from "./components/EquipmentPrompt";
import Welcome from "./components/Welcome";
import Workout from "./components/Workout";

const STORAGE_KEY = "homebody.activeLevels.v1";
const EQUIP_KEY = "homebody.equipment.v1";
const WELCOME_KEY = "homebody.welcomed.v1";

function loadActiveLevels() {
  const defaults = Object.fromEntries(TREES.map((t) => [t.id, 0]));
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const saved = JSON.parse(raw);
    // Overlay saved values onto defaults so new/removed trees don't break the shape,
    // and clamp in case a progression got shorter.
    return Object.fromEntries(
      TREES.map((t) => {
        const v = saved?.[t.id];
        const maxIdx = t.nodes.length - 1;
        const level = Number.isInteger(v) && v >= 0 && v <= maxIdx ? v : 0;
        return [t.id, level];
      })
    );
  } catch {
    return defaults;
  }
}

function loadOwned() {
  try {
    const raw = localStorage.getItem(EQUIP_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set();
    return new Set(arr.filter((id) => EQUIPMENT_IDS.has(id)));
  } catch {
    return new Set();
  }
}

// Keep every row's selected level on an unlocked tile for the current equipment.
// Prefer the nearest unlocked tile at or below the current one; a row with no
// unlocked tile at all (e.g. Pull-up with no bar) becomes null and is treated as
// locked everywhere downstream.
function clampLevels(levels, owned) {
  const out = {};
  for (const t of TREES) {
    const unlocked = t.nodes.map((n, i) => (nodeUnlocked(n, owned) ? i : -1)).filter((i) => i >= 0);
    if (unlocked.length === 0) {
      out[t.id] = null;
      continue;
    }
    const cur = levels[t.id];
    if (cur != null && unlocked.includes(cur)) {
      out[t.id] = cur;
      continue;
    }
    if (cur == null) {
      // Row just became available — start at the easiest unlocked tile.
      out[t.id] = unlocked[0];
      continue;
    }
    // Current selection got locked — fall back to the nearest unlocked tile below it.
    const below = unlocked.filter((i) => i <= cur);
    out[t.id] = below.length ? below[below.length - 1] : unlocked[0];
  }
  return out;
}

export default function App() {
  const [owned, setOwned] = useState(loadOwned);
  const [activeLevels, setActiveLevels] = useState(() => clampLevels(loadActiveLevels(), loadOwned()));
  const [view, setView] = useState("home"); // "home" | "about" | "gym"
  const [openExercise, setOpenExercise] = useState(null);
  const [equipPrompt, setEquipPrompt] = useState(null); // { treeId, nodeIndex, node }
  const [workoutActive, setWorkoutActive] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return !localStorage.getItem(WELCOME_KEY);
    } catch {
      return false;
    }
  });

  const dismissWelcome = () => {
    try {
      localStorage.setItem(WELCOME_KEY, "1");
    } catch {
      // Storage disabled — it'll just show again next visit.
    }
    setShowWelcome(false);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activeLevels));
    } catch {
      // Quota exceeded or storage disabled — nothing to do.
    }
  }, [activeLevels]);

  useEffect(() => {
    try {
      localStorage.setItem(EQUIP_KEY, JSON.stringify([...owned]));
    } catch {
      // Quota exceeded or storage disabled — nothing to do.
    }
    // Re-clamp selections whenever ownership changes so nothing sits on a locked tile.
    setActiveLevels((prev) => clampLevels(prev, owned));
  }, [owned]);

  const toggleEquipment = (id) => {
    setOwned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Confirming a locked tile's gear adds the chosen equipment, and selects that
  // tile as the row's level only if the added gear actually unlocks it.
  const confirmEquipment = (treeId, nodeIndex, node, addIds) => {
    const nextOwned = new Set(owned);
    addIds.forEach((id) => nextOwned.add(id));
    setOwned(nextOwned);
    if (nodeUnlocked(node, nextOwned)) {
      setActiveLevels((prev) => ({ ...prev, [treeId]: nodeIndex }));
    }
  };

  const isHome = view === "home";

  // Sliding underline that glides between the active page's title across the header.
  const rowRef = useRef(null);
  const tabRefs = { home: useRef(null), about: useRef(null), gym: useRef(null) };
  const [indicator, setIndicator] = useState(null);

  const measureIndicator = useCallback(() => {
    const el = tabRefs[view]?.current;
    const row = rowRef.current;
    if (!el || !row) return;
    const er = el.getBoundingClientRect();
    const rr = row.getBoundingClientRect();
    setIndicator({ left: er.left - rr.left, top: er.bottom - rr.top, width: er.width });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  useLayoutEffect(measureIndicator, [measureIndicator]);

  useEffect(() => {
    window.addEventListener("resize", measureIndicator);
    let cancelled = false;
    // Font swap (Fraunces/DM Sans) changes title widths — remeasure once they load.
    if (document.fonts?.ready) document.fonts.ready.then(() => !cancelled && measureIndicator());
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measureIndicator);
    };
  }, [measureIndicator]);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700&family=Fraunces:wght@300;500;700&display=swap"
        rel="stylesheet"
      />
      <style dangerouslySetInnerHTML={{ __html: `
        html, body { height: 100%; }
        body { margin: 0; overflow: hidden; background: #faf8f4; }
        #root { height: 100dvh; }
        * { -webkit-tap-highlight-color: transparent; }
        .rows-scroller::-webkit-scrollbar { display: none; }
      ` }} />
      <div style={{
        background: "#faf8f4",
        color: "#3a352e",
        fontFamily: "'DM Sans', sans-serif",
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>
        <div style={{
          background: "#f7f4ef",
          borderBottom: "1px solid #e8e2d8",
          flexShrink: 0,
          width: "100%",
        }}>
          <div ref={rowRef} style={{
            position: "relative",
            maxWidth: "480px",
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 18px 12px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", minWidth: 0 }}>
              <button
                type="button"
                onClick={() => setView("home")}
                style={{
                  background: "none",
                  border: "none",
                  padding: "4px 0",
                  cursor: "pointer",
                  fontSize: "18px",
                  fontWeight: 600,
                  fontFamily: "'Fraunces', serif",
                  color: isHome ? "#3a352e" : "#6a85a0",
                }}
              >
                <span ref={tabRefs.home}>Homebody</span>
              </button>
            </div>
            {/* Disabled (grayed) off-home rather than hidden, so the header stays constant. */}
            <button
              type="button"
              onClick={() => setWorkoutActive(true)}
              disabled={!isHome}
              style={{
                flexShrink: 0,
                position: "relative",
                zIndex: 1,
                background: isHome ? "#7f9870" : "#e6e1d7",
                border: "none",
                padding: "7px 16px",
                borderRadius: "999px",
                cursor: isHome ? "pointer" : "default",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.3px",
                color: isHome ? "#fff" : "#a8a094",
                boxShadow: isHome ? "0 1px 2px rgba(40,30,20,0.12)" : "none",
              }}
            >
              Start workout
            </button>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "14px", minWidth: 0 }}>
              <NavLink ref={tabRefs.gym} onClick={() => setView("gym")} active={view === "gym"}>My Gym</NavLink>
              <NavLink ref={tabRefs.about} onClick={() => setView("about")} active={view === "about"}>About</NavLink>
            </div>
            {indicator && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: indicator.left,
                  top: indicator.top,
                  width: indicator.width,
                  height: "1.5px",
                  background: "#3a352e",
                  pointerEvents: "none",
                  transition: "left 0.28s ease, width 0.28s ease, top 0.28s ease",
                }}
              />
            )}
          </div>
        </div>
        <div style={{
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          {view === "about" ? (
            <About />
          ) : view === "gym" ? (
            <MyGym owned={owned} onToggle={toggleEquipment} />
          ) : (
          <div className="rows-scroller" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "6px 0 10px",
            minHeight: 0,
            overflowY: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}>
            {TREES.map((t, idx) => {
              const caption = { 0: "First Pair", 2: "Second Pair", 4: "Third Pair", 6: "Core Triplet" }[idx];
              return (
                <Fragment key={t.id}>
                  {caption && idx !== 0 && (
                    <div style={{
                      height: "1px",
                      margin: "2px 18px 0",
                      background: "#dfd8cc",
                      flexShrink: 0,
                    }} />
                  )}
                  {caption && (
                    <div style={{
                      padding: idx === 0 ? "4px 18px 2px" : "10px 18px 2px",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "10.5px",
                      fontWeight: 700,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                      color: "#a09888",
                      textAlign: "center",
                      flexShrink: 0,
                    }}>
                      {caption}
                    </div>
                  )}
                  <ProgressionRow
                    tree={t}
                    activeLevel={activeLevels[t.id]}
                    owned={owned}
                    onLevelChange={(treeId, level) =>
                      setActiveLevels((prev) =>
                        prev[treeId] === level ? prev : { ...prev, [treeId]: level }
                      )
                    }
                    onOpenInstructions={setOpenExercise}
                    onRequestEquipment={(treeId, nodeIndex, node) =>
                      setEquipPrompt({ treeId, nodeIndex, node })
                    }
                  />
                </Fragment>
              );
            })}
          </div>
          )}
        </div>
      </div>
      <Welcome open={showWelcome} onClose={dismissWelcome} />
      <Instructions exercise={openExercise} onClose={() => setOpenExercise(null)} />
      <EquipmentPrompt
        prompt={equipPrompt}
        owned={owned}
        onConfirm={(addIds) => {
          confirmEquipment(equipPrompt.treeId, equipPrompt.nodeIndex, equipPrompt.node, addIds);
          setEquipPrompt(null);
        }}
        onClose={() => setEquipPrompt(null)}
      />
      {workoutActive && (
        <Workout
          activeLevels={activeLevels}
          onClose={() => setWorkoutActive(false)}
        />
      )}
    </>
  );
}

const NavLink = forwardRef(function NavLink({ onClick, active, children }, ref) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: "none",
        border: "none",
        padding: "4px 0",
        cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        color: active ? "#3a352e" : "#6a85a0",
      }}
    >
      <span ref={ref}>{children}</span>
    </button>
  );
});
